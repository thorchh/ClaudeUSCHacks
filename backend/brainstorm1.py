from anthropic import Anthropic
import json
import os
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app) # Enable CORS for all routes

# Initialize the client with an API key
client = Anthropic(api_key="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")
MODEL = "claude-3-7-sonnet-20250219"

freewriting = (
    "okay so I’ve been thinking a lot about how I get feedback from people — like, not just reviews but random stuff — a DM here, some notes in a doc, comments on a Figma file, a voicemail even. "
    "it’s all over the place and I always lose track of what I’m supposed to actually do with it. "
    "sometimes I forget a client even gave me feedback until it’s too late. "
    "is there some kind of way to collect it all? not like another to-do app, more like, a way to see all the feedback in one view? "
    "maybe it could even tell me which stuff is important or like urgent vs whatever. "
    "idk maybe it’s stupid but it feels like there's something here — something like a ‘feedback inbox’ or a smart assistant that just helps me stay on top of that stuff. "
    "but idk how it would get all the inputs from so many places — like, would it need to connect to email and Slack and Google Drive? that sounds messy. "
    "but also useful. anyway just brain dumping."
)

def run_claude_tool(tool_name, tool_schema, query):
    # Determine max_tokens based on tool_name
    max_tokens_for_call = 16384 if tool_name == "generate_full_report" else 4096

    response = client.messages.create(
        model=MODEL,
        max_tokens=max_tokens_for_call, # Use adjusted max_tokens
        tools=tool_schema,
        tool_choice={"type": "tool", "name": tool_name},
        messages=[{"role": "user", "content": query}]
    )
    # Log the raw response for debugging, especially for the report generation
    print(f"--- Raw Anthropic Response for {tool_name} (Max Tokens: {max_tokens_for_call}) ---")
    print(f"Response ID: {response.id}")
    print(f"Response Model: {response.model}")
    print(f"Response Stop Reason: {response.stop_reason}")
    print(f"Response Stop Sequence: {response.stop_sequence}")
    print(f"Response Usage: {response.usage}")
    print(f"Response Content: {response.content}") # Print the content list
    print("--- End Raw Response ---")

    for content in response.content:
        if content.type == "tool_use" and content.name == tool_name:
            return content.input
    # If the loop finishes without finding the tool_use, log and return {}
    print(f"Warning: Tool use '{tool_name}' not found in response content:")
    return {}

# === Step 1: Intake ===
theme_tool = [{
    "name": "extract_themes",
    "description": "Extracts key themes from freewriting.",
    "input_schema": {
        "type": "object",
        "properties": {
            "themes": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Key themes present in the input text"
            }
        },
        "required": ["themes"]
    }
}]

context_tool = [{
    "name": "intake_context",
    "description": "Captures basic context about the user's intent and background.",
    "input_schema": {
        "type": "object",
        "properties": {
            "user_goal": {"type": "string"},
            "target_users": {"type": "string"},
            "known_constraints": {"type": "string"}
        },
        "required": ["user_goal", "target_users", "known_constraints"]
    }
}]

clarification_tool = [{
    "name": "clarify_concept",
    "description": "Parses keywords, objectives, assumptions, and checks for missing detail.",
    "input_schema": {
        "type": "object",
        "properties": {
            "keywords": {"type": "array", "items": {"type": "string"}},
            "objectives": {"type": "string"},
            "assumptions": {"type": "array", "items": {"type": "string"}},
            "need_more_detail": {"type": "boolean"},
            "missing_detail_question": {"type": "string"}
        },
        "required": ["keywords", "objectives", "assumptions", "need_more_detail", "missing_detail_question"]
    }
}]

constructive_pushback_tool = [{
    "name": "constructive_pushback",
    "description": "Summarizes key risks and blindspots, then generates a supportive follow-up question.",
    "input_schema": {
        "type": "object",
        "properties": {
            "summary_of_pushback": {"type": "string"},
            "curiosity_question": {"type": "string"}
        },
        "required": ["summary_of_pushback", "curiosity_question"]
    }
}]

core_problem_tool = [{
    "name": "summarize_core_problem",
    "description": "Summarizes the core problem, user pain, and constraints in a concise, actionable way for use in downstream prompts.",
    "input_schema": {
        "type": "object",
        "properties": {
            "core_problem": {"type": "string"}
        },
        "required": ["core_problem"]
    }
}]

meta_creativity_tool = [{
    "name": "meta_creativity",
    "description": "Applies SCAMPER, first principles, phenomenological inquiry, and Six Thinking Hats.",
    "input_schema": {
        "type": "object",
        "properties": {
            "scamper_variations": {"type": "array", "items": {"type": "string"}},
            "first_principles_breakdown": {"type": "string"},
            "phenomenological_insight": {"type": "string"},
            "six_hats_summary": {
                "type": "object",
                "properties": {
                    "white": {"type": "string"},
                    "red": {"type": "string"},
                    "black": {"type": "string"},
                    "yellow": {"type": "string"},
                    "green": {"type": "string"},
                    "blue": {"type": "string"}
                },
                "required": ["white", "red", "black", "yellow", "green", "blue"]
            }
        },
        "required": ["scamper_variations", "first_principles_breakdown", "phenomenological_insight", "six_hats_summary"]
    }
}]

cross_pollination_tool = [{
    "name": "cross_pollination",
    "description": "Generates analogical and hybrid idea mutations.",
    "input_schema": {
        "type": "object",
        "properties": {
            "cross_industry_analogies": {"type": "array", "items": {"type": "string"}},
            "hybrid_concepts": {"type": "array", "items": {"type": "string"}},
            "meta_trend_inspirations": {"type": "array", "items": {"type": "string"}},
            "remixed_business_models": {"type": "array", "items": {"type": "string"}}
        },
        "required": ["cross_industry_analogies", "hybrid_concepts", "meta_trend_inspirations", "remixed_business_models"]
    }
}]

feasibility_tool = [{
    "name": "score_feasibility",
    "description": "Scores feasibility of an idea given context and constraints.",
    "input_schema": {
        "type": "object",
        "properties": {
            "technical_feasibility": {"type": "number"},
            "market_feasibility": {"type": "number"},
            "novelty": {"type": "number"},
            "execution_risks": {"type": "string"}
        },
        "required": ["technical_feasibility", "market_feasibility", "novelty", "execution_risks"]
    }
}]

# === Step 5: Research Layer ===
# Expanded research agent schemas with summarized_insights and examples
research_agents = [
    {
        "name": "user_psychology",
        "description": "Analyzes psychological factors, user behavior, and motivation.",
        "input_schema": {
            "type": "object",
            "properties": {
                "summarized_insights": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "2-3 concise, actionable insights about user psychology. Example: 'Users feel overwhelmed by fragmented feedback channels.'"
                },
                "key_behaviors": {"type": "array", "items": {"type": "string"}},
                "pain_points": {"type": "array", "items": {"type": "string"}},
                "motivators": {"type": "array", "items": {"type": "string"}}
            },
            "required": ["summarized_insights", "key_behaviors", "pain_points", "motivators"]
        }
    },
    {
        "name": "business_value",
        "description": "Assesses business value, ROI, and monetization opportunities.",
        "input_schema": {
            "type": "object",
            "properties": {
                "summarized_insights": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "2-3 concise, actionable business insights. Example: 'Centralizing feedback can reduce project delays by 15%.'"
                },
                "roi_drivers": {"type": "array", "items": {"type": "string"}},
                "monetization_models": {"type": "array", "items": {"type": "string"}},
                "cost_risks": {"type": "array", "items": {"type": "string"}}
            },
            "required": ["summarized_insights", "roi_drivers", "monetization_models", "cost_risks"]
        }
    },
    {
        "name": "market_research",
        "description": "Identifies target audience, market size, and competitive landscape.",
        "input_schema": {
            "type": "object",
            "properties": {
                "summarized_insights": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "2-3 concise, actionable market insights. Example: 'SMBs are underserved in feedback management tools.'"
                },
                "audience_segments": {"type": "array", "items": {"type": "string"}},
                "market_size": {"type": "string"},
                "top_competitors": {"type": "array", "items": {"type": "string"}}
            },
            "required": ["summarized_insights", "audience_segments", "market_size", "top_competitors"]
        }
    },
    {
        "name": "integration_tech",
        "description": "Assesses technical feasibility, integration points, and architecture.",
        "input_schema": {
            "type": "object",
            "properties": {
                "summarized_insights": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "2-3 concise, actionable technical insights. Example: 'Email and Slack APIs are the most requested integrations.'"
                },
                "integration_points": {"type": "array", "items": {"type": "string"}},
                "tech_stack_options": {"type": "array", "items": {"type": "string"}},
                "implementation_risks": {"type": "array", "items": {"type": "string"}}
            },
            "required": ["summarized_insights", "integration_points", "tech_stack_options", "implementation_risks"]
        }
    },
    {
        "name": "future_trends",
        "description": "Analyzes future trends, innovation, and long-term potential.",
        "input_schema": {
            "type": "object",
            "properties": {
                "summarized_insights": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "2-3 concise, actionable trend insights. Example: 'AI-driven feedback triage is an emerging expectation.'"
                },
                "emerging_trends": {"type": "array", "items": {"type": "string"}},
                "potential_disruptors": {"type": "array", "items": {"type": "string"}},
                "long_term_opportunities": {"type": "array", "items": {"type": "string"}}
            },
            "required": ["summarized_insights", "emerging_trends", "potential_disruptors", "long_term_opportunities"]
        }
    },
    {
        "name": "market_intelligence",
        "description": "Pulls news, social sentiment, patent filings, startup funding, identifies hype/traction mismatch, under-discussed trends, and behavioral data correlations.",
        "input_schema": {
            "type": "object",
            "properties": {
                "summarized_insights": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "2-3 concise, actionable market intelligence insights. Example: 'Recent funding rounds show increased investor interest in feedback tech.'"
                },
                "news_insights": {"type": "array", "items": {"type": "string"}},
                "social_sentiment": {"type": "array", "items": {"type": "string"}},
                "patent_trends": {"type": "array", "items": {"type": "string"}},
                "startup_activity": {"type": "array", "items": {"type": "string"}},
                "hype_vs_traction": {"type": "string"},
                "under_discussed_trends": {"type": "array", "items": {"type": "string"}},
                "behavioral_correlations": {"type": "array", "items": {"type": "string"}}
            },
            "required": ["summarized_insights", "news_insights", "social_sentiment", "patent_trends", "startup_activity", "hype_vs_traction", "under_discussed_trends", "behavioral_correlations"]
        }
    },
    {
        "name": "competitive_analysis",
        "description": "Scans for competitors, SWOT, saturation, business models, and outputs opportunity gaps with justification.",
        "input_schema": {
            "type": "object",
            "properties": {
                "summarized_insights": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "2-3 concise, actionable competitive insights. Example: 'Most competitors lack cross-platform feedback aggregation.'"
                },
                "direct_competitors": {"type": "array", "items": {"type": "string"}},
                "indirect_competitors": {"type": "array", "items": {"type": "string"}},
                "swot_profiles": {"type": "array", "items": {"type": "string"}},
                "saturation_map": {"type": "string"},
                "business_model_archetypes": {"type": "array", "items": {"type": "string"}},
                "opportunity_gaps": {"type": "array", "items": {"type": "string"}}
            },
            "required": ["summarized_insights", "direct_competitors", "indirect_competitors", "swot_profiles", "saturation_map", "business_model_archetypes", "opportunity_gaps"]
        }
    },
    {
        "name": "analogical_synthesis",
        "description": "Performs lateral ideation via cross-industry inspiration, business model remixing, metaphorical mutation, and proposes 3–5 hybrid concepts with justification.",
        "input_schema": {
            "type": "object",
            "properties": {
                "summarized_insights": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "2-3 concise, actionable analogical insights. Example: 'Borrowing onboarding flows from fintech apps could improve feedback adoption.'"
                },
                "hybrid_concepts": {"type": "array", "items": {"type": "string"}},
                "structure_mapping": {"type": "string"},
                "causal_layered_analysis": {"type": "string"},
                "justifications": {"type": "array", "items": {"type": "string"}}
            },
            "required": ["summarized_insights", "hybrid_concepts", "structure_mapping", "causal_layered_analysis", "justifications"]
        }
    },
    {
        "name": "contrarian_research",
        "description": "Hunts disconfirming data: market pullbacks, critical press, early adopter resistance, ensures robustness and anti-echo-chamber integrity.",
        "input_schema": {
            "type": "object",
            "properties": {
                "summarized_insights": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "2-3 concise, actionable contrarian insights. Example: 'Some early adopters report notification fatigue from feedback tools.'"
                },
                "disconfirming_data": {"type": "array", "items": {"type": "string"}},
                "critical_press": {"type": "array", "items": {"type": "string"}},
                "adopter_resistance": {"type": "array", "items": {"type": "string"}},
                "robustness_notes": {"type": "string"}
            },
            "required": ["summarized_insights", "disconfirming_data", "critical_press", "adopter_resistance", "robustness_notes"]
        }
    }
]

@app.route('/api/brainstorm/research/available_agents', methods=['GET'])
def get_available_research_agents():
    agent_names = [agent['name'] for agent in research_agents]
    return jsonify({'phase': 'research', 'step': 'available_agents', 'data': agent_names})

@app.route('/api/brainstorm/research/agent', methods=['POST'])
def run_research_agent():
    # Parse incoming JSON request
    data = request.get_json()
    selected_idea = data.get('selected_idea')
    agent_name = data.get('agent_name')
    combined_context = data.get('combined_context')
    round_num = data.get('round_num', 1)

    # Validate required fields
    if not selected_idea or not agent_name or not combined_context:
        return jsonify({"error": "Missing 'selected_idea', 'agent_name', or 'combined_context' in request body"}), 400

    # Find the schema for the requested research agent
    agent_schema = next((agent for agent in research_agents if agent['name'] == agent_name), None)
    if not agent_schema:
        return jsonify({"error": f"Agent '{agent_name}' not found"}), 404

    try:
        # Build the prompt for the research agent, including examples for summarized_insights
        prompt = f"""You are the {agent_name.replace('_', ' ').title()} Agent. Given the following idea and context, perform your research and output your top insights for this round. It must be connected.

You MUST include a 'summarized_insights' field: a list of 2-3 concise, actionable insights for this agent.

Example for user_psychology: ['Users feel overwhelmed by fragmented feedback channels.', 'Timely feedback increases engagement by 30%.']
Example for business_value: ['Centralizing feedback can reduce project delays by 15%.', 'Subscription model is most viable for SMBs.']
Example for market_research: ['SMBs are underserved in feedback management tools.', 'Top competitors lack AI-driven triage.']
Example for integration_tech: ['Email and Slack APIs are the most requested integrations.', 'Automated onboarding reduces friction.']
Example for future_trends: ['AI-driven feedback triage is an emerging expectation.', 'Voice feedback is a rising trend.']

<idea>
{selected_idea}
</idea>
<context>
{json.dumps(combined_context, indent=2)}
</context>
This is round {round_num}.
"""
        # Call the Claude tool with the agent schema and prompt
        agent_result = run_claude_tool(
            agent_name,
            [agent_schema],
            prompt
        )
        # Return the agent's research output
        return jsonify({'phase': 'research', 'step': 'agent_insight', 'agent_name': agent_name, 'round': round_num, 'data': agent_result})
    except Exception as e:
        print(f"Error in /research/agent for agent {agent_name}: {e}")
        return jsonify({'phase': 'research', 'step': 'agent_insight', 'agent_name': agent_name, 'error': str(e)}), 500

# === Step 6: Multi-Agent Dialectical Debate ===
AGENT_ROLES = [
    "Market Agent",
    "Feature Agent",
    "Synthesis Agent",
    "Contrarian Agent",
    "Fusion Agent"
]

AGENT_PROMPTS = {
    "Market Agent": "You are the Market Agent. Your job is to analyze the idea from a market and adoption perspective. Consider user demand, market size, competition, and go-to-market risks. Present your findings, critique others' logic, and vote on tradeoffs (1-10, higher is better). Weight your arguments based on empirical support.",
    "Feature Agent": "You are the Feature Agent. Your job is to analyze the idea from a product and feature perspective. Consider technical feasibility, feature set, user experience, and implementation complexity. Present your findings, critique others' logic, and vote on tradeoffs (1-10, higher is better). Weight your arguments based on empirical support.",
    "Synthesis Agent": "You are the Synthesis Agent. Your job is to integrate and balance the perspectives of all other agents, seeking a holistic and pragmatic solution. Present your findings, critique others' logic, and vote on tradeoffs (1-10, higher is better). Weight your arguments based on empirical support.",
    "Contrarian Agent": "You are the Contrarian Agent. Your job is to challenge assumptions, surface blindspots, and identify risks or overlooked downsides. Present your findings, critique others' logic, and vote on tradeoffs (1-10, higher is better). Weight your arguments based on empirical support.",
    "Fusion Agent": "You are the Fusion Agent. Your job is to propose creative integrations, hybrid solutions, or novel combinations based on the debate. Present your findings, critique others' logic, and vote on tradeoffs (1-10, higher is better). Weight your arguments based on empirical support."
}

agent_debate_tool = [{
    "name": "agent_debate_round",
    "description": "Each agent presents findings, critiques others, and votes on tradeoffs. Arguments are weighted by empirical support. Agents must use chain-of-thought reasoning, justify any change or lack of change in their vote/weight, and explicitly reference critiques or evidence that influenced their position.",
    "input_schema": {
        "type": "object",
        "properties": {
            "agent_name": {"type": "string"},
            "insight": {"type": "string"},
            "critiques": {"type": "array", "items": {"type": "string"}},
            "vote": {"type": "number"},
            "empirical_weight": {"type": "number"},
            "change_log": {"type": "string"},
            "chain_of_thought": {"type": "string"}
        },
        "required": ["agent_name", "insight", "critiques", "vote", "empirical_weight", "change_log", "chain_of_thought"]
    }
}]

# === Step 7: Feature Ideation & Prioritization ===
feature_ideation_tool = [{
    "name": "feature_ideation",
    "description": "Generates must-have vs nice-to-have features, feasibility, technical complexity, cost/time estimates, and suggests pivots based on user feedback.",
    "input_schema": {
        "type": "object",
        "properties": {
            "must_have_features": {"type": "array", "items": {"type": "string"}},
            "nice_to_have_features": {"type": "array", "items": {"type": "string"}},
            "feasibility_notes": {"type": "string"},
            "technical_complexity": {"type": "string"},
            "cost_time_estimates": {"type": "string"},
            "feature_pivots": {"type": "array", "items": {"type": "string"}}
        },
        "required": ["must_have_features", "nice_to_have_features", "feasibility_notes", "technical_complexity", "cost_time_estimates", "feature_pivots"]
    }
}]

# === Step 8: Competitive & Gap Analysis ===
competitive_intel_tool = [{
    "name": "competitive_intelligence",
    "description": "Maps competitors, blue ocean gaps, SWOT, highlights underserved segments, emerging players.",
    "input_schema": {
        "type": "object",
        "properties": {
            "direct_competitors": {"type": "array", "items": {"type": "string"}},
            "indirect_competitors": {"type": "array", "items": {"type": "string"}},
            "blue_ocean_gaps": {"type": "array", "items": {"type": "string"}},
            "swot_profiles": {"type": "array", "items": {"type": "string"}},
            "underserved_segments": {"type": "array", "items": {"type": "string"}},
            "emerging_players": {"type": "array", "items": {"type": "string"}}
        },
        "required": ["direct_competitors", "indirect_competitors", "blue_ocean_gaps", "swot_profiles", "underserved_segments", "emerging_players"]
    }
}]

# === Step 9: MVP Design & Execution Blueprint ===
roadmap_tool = [{
    "name": "mvp_roadmap",
    "description": "Produces MVP architecture, implementation plan, technical validation, and collaborates with Feature Agent for realism.",
    "input_schema": {
        "type": "object",
        "properties": {
            "mvp_architecture": {"type": "string"},
            "implementation_plan": {"type": "string"},
            "technical_validation": {"type": "string"},
            "collaboration_notes": {"type": "string"}
        },
        "required": ["mvp_architecture", "implementation_plan", "technical_validation", "collaboration_notes"]
    }
}]

# === Research Summary Tool === (Define globally)
research_summary_tool = [{
    "name": "summarize_research_context",
    "description": "Summarizes research findings into concise context for debate agents.",
    "input_schema": {
        "type": "object",
        "properties": {
            "research_summary": {
                "type": "string",
                "description": "A concise summary of the research findings, highlighting key insights, risks, and opportunities relevant to the selected idea."
            }
        },
        "required": ["research_summary"]
    }
}]

# === Debate Summary Tool ===
summarize_debate_tool = [{
    "name": "summarize_debate",
    "description": "Summarizes a multi-agent debate log, highlighting key arguments, agreements, disagreements, and final consensus or tensions.",
    "input_schema": {
        "type": "object",
        "properties": {
            "debate_summary": {
                "type": "string",
                "description": "A concise yet comprehensive summary of the debate, suitable for inclusion in a final report."
            }
        },
        "required": ["debate_summary"]
    }
}]

# === Report Generation Tool === (Define globally)
# Tool for generating the full report
full_report_tool = [{
    "name": "generate_full_report",
    "description": "Generates the complete final brainstorm report based on all provided context.",
    "input_schema": {
        "type": "object",
        "properties": {
            "full_report_content": {
                "type": "string",
                "description": "The complete, formatted final report content, including all sections like Executive Summary, Problem Definition, Research, Debate, Features, Market, Roadmap, and Conclusion."
            }
        },
        "required": ["full_report_content"]
    }
}]

# Tool for generating individual sections (kept for potential future use or reference, but not used by generate_full_report)
report_section_tool = [{
    "name": "generate_report_section",
    "description": "Generates a specific section of the final report.",
    "input_schema": {
        "type": "object",
        "properties": {
            "section_title": {"type": "string"},
            "content": {"type": "string"}
        },
        "required": ["section_title", "content"]
    }
}]

# === Phase 1: Intake & Idea Refinement ===

@app.route('/api/brainstorm/refine/themes', methods=['POST'])
def get_themes():
    data = request.get_json()
    current_freewriting = data.get('freewriting', freewriting) # Use provided or default
    try:
        themes = run_claude_tool(
            "extract_themes",
            theme_tool,
            f"Extract themes from the following text and use the `extract_themes` tool.\n\n<freewriting>\n{current_freewriting}\n</freewriting>\n"
        )
        return jsonify({'phase': 'refine', 'step': 'themes', 'data': themes})
    except Exception as e:
        print(f"Error in /refine/themes: {e}")
        return jsonify({'phase': 'refine', 'step': 'themes', 'error': str(e)}), 500

@app.route('/api/brainstorm/refine/context', methods=['POST'])
def get_context():
    data = request.get_json()
    current_freewriting = data.get('freewriting', freewriting) # Use provided or default
    try:
        context_input = run_claude_tool(
            "intake_context",
            context_tool,
            f"Simulate the intake context step for someone trying to solve the problem described in this brainstorming text.\n\n<freewriting>\n{current_freewriting}\n</freewriting>\n\nNow use the `intake_context` tool to summarize goal, audience, and constraints.\n"
        )
        return jsonify({'phase': 'refine', 'step': 'context', 'data': context_input})
    except Exception as e:
        print(f"Error in /refine/context: {e}")
        return jsonify({'phase': 'refine', 'step': 'context', 'error': str(e)}), 500

@app.route('/api/brainstorm/refine/clarification', methods=['POST'])
def get_clarification():
    data = request.get_json()
    context_input = data.get('context_input')
    if not context_input:
        return jsonify({"error": "Missing 'context_input' in request body"}), 400
    try:
        clarification = run_claude_tool(
            "clarify_concept",
            clarification_tool,
            f"You are a concept clarification agent. Parse the following context for keywords, objectives, and assumptions. If any important detail is missing or ambiguous, set 'need_more_detail' to true and ask a specific follow-up question in 'missing_detail_question'. Otherwise, set 'need_more_detail' to false.\n\n<context>\n{json.dumps(context_input, indent=2)}\n</context>\n\nUse the `clarify_concept` tool to respond.\n"
        )
        return jsonify({'phase': 'refine', 'step': 'clarification', 'data': clarification})
    except Exception as e:
        print(f"Error in /refine/clarification: {e}")
        return jsonify({'phase': 'refine', 'step': 'clarification', 'error': str(e)}), 500

@app.route('/api/brainstorm/refine/pushback', methods=['POST'])
def get_pushback():
    data = request.get_json()
    context_input = data.get('context_input')
    themes = data.get('themes')
    if not context_input or themes is None:
        return jsonify({"error": "Missing 'context_input' or 'themes' in request body"}), 400
    try:
        # Accept both list and dict for themes
        if isinstance(themes, dict):
            themes_list = themes.get('themes', [])
        else:
            themes_list = themes
        pushback = run_claude_tool(
            "constructive_pushback",
            constructive_pushback_tool,
            f"Given the following context and themes, summarize the most important risks or blindspots (1–2 sentences), then ask a supportive, curiosity-driven question.\n\n<context>\n{json.dumps(context_input, indent=2)}\n</context>\n<themes>\n{json.dumps(themes_list, indent=2)}\n</themes>\n\nUse the `constructive_pushback` tool to respond.\n"
        )
        return jsonify({'phase': 'refine', 'step': 'pushback', 'data': pushback})
    except Exception as e:
        print(f"Error in /refine/pushback: {e}")
        return jsonify({'phase': 'refine', 'step': 'pushback', 'error': str(e)}), 500

@app.route('/api/brainstorm/refine/core_problem', methods=['POST'])
def get_core_problem():
    data = request.get_json()
    context_input = data.get('context_input')
    clarification = data.get('clarification')
    if not context_input or not clarification:
        return jsonify({"error": "Missing 'context_input' or 'clarification' in request body"}), 400
    try:
        core_problem_result = run_claude_tool(
            "summarize_core_problem",
            core_problem_tool,
            f"Given the following context and clarification, summarize the core problem, user pain, and constraints in a concise, actionable way. This summary will be used to anchor all downstream idea generation prompts, so make it practical and specific to the user's needs.\n\n<context>\n{json.dumps(context_input, indent=2)}\n</context>\n<clarification>\n{json.dumps(clarification, indent=2)}\n</clarification>\n"
        )
        core_problem = core_problem_result.get("core_problem", "Core problem could not be summarized.")
        return jsonify({'phase': 'refine', 'step': 'core_problem', 'data': core_problem})
    except Exception as e:
        print(f"Error in /refine/core_problem: {e}")
        return jsonify({'phase': 'refine', 'step': 'core_problem', 'error': str(e)}), 500

@app.route('/api/brainstorm/refine/creative_expansion', methods=['POST'])
def get_creative_expansion():
    data = request.get_json()
    core_problem = data.get('core_problem')
    combined_context = data.get('combined_context') # Frontend needs to construct this
    user_idea = combined_context.get('context', {}).get('user_goal', '') if combined_context else ''
    if not core_problem or not combined_context:
         return jsonify({"error": "Missing 'core_problem' or 'combined_context' in request body"}), 400
    try:
        creative_expansion = run_claude_tool(
            "meta_creativity",
            meta_creativity_tool,
            f"""
You are a meta-creative agent. Expand on the following user idea and core problem, but do NOT stray from the user's context and constraints.

User Idea:
{user_idea}

Core Problem:
{core_problem}

Apply each of the following frameworks to generate practical, actionable, and relevant variations or insights:
- SCAMPER (Substitute, Combine, Adapt, Modify, Put to another use, Eliminate, Reverse)
- First Principles decomposition
- Phenomenological inquiry (describe the user's lived experience and pain)
- Six Thinking Hats (summarize the idea from each hat's perspective)

All outputs must be tightly relevant to the user's context and pain points. Do NOT generate outlandish, absurd, impossible, or irrelevant ideas. Avoid anything magical, sci-fi, or unrelated to the user's domain.

Limit the number of SCAMPER variations to 6.

For each SCAMPER variation, use structured chain-of-thought reasoning. Output your reasoning in <thinking> tags and the final idea in <answer> tags. Think step-by-step, breaking down the problem and solution in detail.

<context>
{json.dumps(combined_context, indent=2)}
</context>
"""
        )
        return jsonify({'phase': 'refine', 'step': 'creative_expansion', 'data': creative_expansion})
    except Exception as e:
        print(f"Error in /refine/creative_expansion: {e}")
        return jsonify({'phase': 'refine', 'step': 'creative_expansion', 'error': str(e)}), 500

@app.route('/api/brainstorm/refine/cross_analogs', methods=['POST'])
def get_cross_analogs():
    data = request.get_json()
    core_problem = data.get('core_problem')
    combined_context = data.get('combined_context') # Frontend needs to construct this
    user_idea = combined_context.get('context', {}).get('user_goal', '') if combined_context else ''
    if not core_problem or not combined_context:
         return jsonify({"error": "Missing 'core_problem' or 'combined_context' in request body"}), 400
    try:
        cross_analogs = run_claude_tool(
            "cross_pollination",
            cross_pollination_tool,
            f"""
You are an innovation agent. Using the following user idea and core problem, generate practical, actionable, and relevant idea variants by:
- Drawing analogies from other industries (cross-industry analogies)
- Proposing hybrid concepts that combine the user's idea with proven solutions from other domains

User Idea:
{user_idea}

Core Problem:
{core_problem}

All outputs must be tightly relevant to the user's context and pain points. Do NOT generate outlandish, absurd, impossible, or irrelevant ideas. Avoid anything magical, sci-fi, or unrelated to the user's domain.

For each analogy, explain in 1-2 sentences exactly how the analogy applies to the user's idea and what specific feature, workflow, or insight it inspires.

Limit the number of analogies to 6, and ensure each is clearly distinct and directly applicable to the user's problem.

For each hybrid concept, first think: use structured chain-of-thought reasoning. Output your reasoning in <thinking> tags and the final idea in <answer> tags. Think step-by-step, breaking down the problem and solution in detail.

<context>
{json.dumps(combined_context, indent=2)}
</context>
<core_problem>
{core_problem}
</core_problem>
"""
        )
        return jsonify({'phase': 'refine', 'step': 'cross_analogs', 'data': cross_analogs})
    except Exception as e:
        print(f"Error in /refine/cross_analogs: {e}")
        return jsonify({'phase': 'refine', 'step': 'cross_analogs', 'error': str(e)}), 500

@app.route('/api/brainstorm/refine/variant_pushback', methods=['POST'])
def get_variant_pushback():
    data = request.get_json()
    idea_variant = data.get('idea_variant')
    if not idea_variant:
        return jsonify({"error": "Missing 'idea_variant' in request body"}), 400
    try:
        variant_pushback = run_claude_tool(
            "constructive_pushback",
            constructive_pushback_tool,
            f"Given the following idea variant, summarize the most important risks or blindspots (1–2 sentences), then ask a curiosity-driven question (for display only, not for user response).\n\n<idea>\n{idea_variant}\n</idea>\n"
        )
        return jsonify({'phase': 'refine', 'step': 'variant_pushback', 'data': variant_pushback})
    except Exception as e:
        print(f"Error in /refine/variant_pushback: {e}")
        return jsonify({'phase': 'refine', 'step': 'variant_pushback', 'error': str(e)}), 500

@app.route('/api/brainstorm/refine/variant_feasibility', methods=['POST'])
def get_variant_feasibility():
    data = request.get_json()
    idea_variant = data.get('idea_variant')
    variant_context = data.get('variant_context') # Frontend needs to construct this
    if not idea_variant or not variant_context:
        return jsonify({"error": "Missing 'idea_variant' or 'variant_context' in request body"}), 400
    try:
        variant_feasibility = run_claude_tool(
            "score_feasibility",
            feasibility_tool,
            f"Score the feasibility of the following idea variant.\n\n<context>\n{json.dumps(variant_context, indent=2)}\n</context>\n<idea>\n{idea_variant}\n</idea>\n"
        )
        return jsonify({'phase': 'refine', 'step': 'variant_feasibility', 'data': variant_feasibility})
    except Exception as e:
        print(f"Error in /refine/variant_feasibility: {e}")
        return jsonify({'phase': 'refine', 'step': 'variant_feasibility', 'error': str(e)}), 500


# === Phase 2: Research ===

@app.route('/api/brainstorm/research/summary', methods=['POST'])
def summarize_research():
    data = request.get_json()
    research_results = data.get('research_results')
    selected_idea = data.get('selected_idea')
    if not research_results or not selected_idea:
        return jsonify({"error": "Missing 'research_results' or 'selected_idea' in request body"}), 400

    try:
        prompt = f"""
You are an expert research summarizer. Your task is to create a comprehensive, information-rich summary for debate agents based on the following research agent findings. The summary should be clear and should mention at the very least the 5 most important points. Return the summary through tool use. 

<research_results>
{json.dumps(research_results, indent=2)}
</research_results>
<idea>
{selected_idea}
</idea>
"""
        summary_result = run_claude_tool(
            "summarize_research_context",
            research_summary_tool,
            prompt
        )
        print(f"Research summary result: {summary_result}")
        return jsonify({'phase': 'research', 'step': 'summary', 'data': summary_result})
    except Exception as e:
        print(f"Error in /research/summary: {e}")
        return jsonify({'phase': 'research', 'step': 'summary', 'error': str(e)}), 500


# === Phase 3: Debate ===

@app.route('/api/brainstorm/debate/available_roles', methods=['GET'])
def get_available_debate_roles():
    return jsonify({'phase': 'debate', 'step': 'available_roles', 'data': AGENT_ROLES})

@app.route('/api/brainstorm/debate/round', methods=['POST'])
def run_debate_round():
    data = request.get_json()
    selected_idea = data.get('selected_idea')
    research_summary = data.get('research_summary')
    agent_role = data.get('agent_role')
    other_feedback = data.get('other_feedback', [])
    round_num = data.get('round_num')

    if not selected_idea or not research_summary or not agent_role or round_num is None:
        return jsonify({"error": "Missing 'selected_idea', 'research_summary', 'agent_role', or 'round_num' in request body"}), 400
    if agent_role not in AGENT_ROLES:
        return jsonify({"error": f"Invalid agent_role: {agent_role}. Must be one of {AGENT_ROLES}"}), 400

    try:
        debate_prompt = f"""{AGENT_PROMPTS[agent_role]}
\nDebate the following idea:
<idea>\n{selected_idea}\n</idea>
<research_summary>\n{research_summary}\n</research_summary>
Here is anonymized feedback from other agents in this round (if any):
{json.dumps(other_feedback, indent=2)}

This is Round {round_num}. At the start of this round, review all critiques and new evidence. Use structured chain-of-thought reasoning: output your step-by-step thinking in <thinking> tags and your final position in <answer> tags. If your vote or weight does not change, you must justify why. If you do change, explain what specifically caused the change. Only assign a high empirical weight if you cite concrete data, studies, or real-world examples; otherwise, use a lower weight. Do not default to 7 or 0.8—your score should reflect your true, updated position. Output a short 'change_log' describing any change in your vote/weight and why it happened (or why it did not). Output your full chain of thought as 'chain_of_thought'. Use the `agent_debate_round` tool.
"""
        round_result = run_claude_tool(
            "agent_debate_round",
            agent_debate_tool,
            debate_prompt
        )
        if 'agent_name' not in round_result:
             round_result['agent_name'] = agent_role

        return jsonify({'phase': 'debate', 'step': 'agent_turn', 'round': round_num, 'agent_role': agent_role, 'data': round_result})
    except Exception as e:
        print(f"Error in /debate/round for agent {agent_role}, round {round_num}: {e}")
        return jsonify({'phase': 'debate', 'step': 'agent_turn', 'round': round_num, 'agent_role': agent_role, 'error': str(e)}), 500

@app.route('/api/brainstorm/debate/summarize', methods=['POST'])
def summarize_debate_log():
    data = request.get_json()
    debate_log = data.get('debate_log')
    selected_idea = data.get('selected_idea', 'the discussed idea')
    if not debate_log:
        return jsonify({"error": "Missing 'debate_log' in request body"}), 400

    try:
        prompt = f"""Summarize the following multi-agent debate log regarding the idea: '{selected_idea}'.
Focus on the key arguments presented by each agent role, significant critiques, areas of agreement and disagreement, and the overall evolution of the discussion. Conclude with the final consensus or unresolved tensions. The summary should be comprehensive enough for a final report.

<debate_log>
{json.dumps(debate_log, indent=2)}
</debate_log>

Use the `summarize_debate` tool to output the summary.
"""
        summary_result = run_claude_tool(
            "summarize_debate",
            summarize_debate_tool,
            prompt
        )

        if not summary_result or not summary_result.get("debate_summary"):
            summary_content = "Error: Debate summary generation failed."
            return jsonify({'phase': 'debate', 'step': 'summary', 'error': summary_content}), 500
        else:
            summary_content = summary_result.get('debate_summary')

        return jsonify({'phase': 'debate', 'step': 'summary', 'data': summary_content})

    except Exception as e:
        error_message = f"Error summarizing debate: {e}"
        print(error_message)
        return jsonify({'phase': 'debate', 'step': 'summary', 'error': error_message}), 500


# === Phase 4: Feature Ideation ===
@app.route('/api/brainstorm/feature_ideation', methods=['POST'])
def get_feature_ideation():
    data = request.get_json()
    combined_context = data.get('combined_context')
    debate_results = data.get('debate_results')
    if not combined_context or not debate_results:
        return jsonify({"error": "Missing 'combined_context' or 'debate_results' in request body"}), 400

    try:
        prompt = f"""You are a Feature Ideation Agent. Given all previous context, debate results, and user feedback, generate:
- Must-have vs nice-to-have features
- Feasibility & technical complexity
- Rough cost & time estimates
- Suggested feature pivots based on user feedback and debate

<context>\n{json.dumps(combined_context, indent=2)}\n</context>
<debate_results>\n{json.dumps(debate_results, indent=2)}\n</debate_results>

Use the `feature_ideation` tool.
"""
        feature_result = run_claude_tool(
            "feature_ideation",
            feature_ideation_tool,
            prompt
        )
        return jsonify({'phase': 'feature_ideation', 'step': 'result', 'data': feature_result})
    except Exception as e:
        print(f"Error in /feature_ideation: {e}")
        return jsonify({'phase': 'feature_ideation', 'step': 'result', 'error': str(e)}), 500

# === Phase 5: Competitive Analysis ===
@app.route('/api/brainstorm/competitive_analysis', methods=['POST'])
def get_competitive_analysis():
    data = request.get_json()
    combined_context = data.get('combined_context')
    debate_results = data.get('debate_results')
    feature_ideation = data.get('feature_ideation')
    if not combined_context or not debate_results or not feature_ideation:
        return jsonify({"error": "Missing 'combined_context', 'debate_results', or 'feature_ideation' in request body"}), 400

    try:
        prompt = f"""You are a Competitive Intelligence Agent. Given all previous context, debate results, and feature ideation, map:
- 3-6 direct and indirect competitors
- 3-6 Blue Ocean gaps
- 3-6 SWOT profiles
- 3-6 underserved segments and emerging players

Be concise and to the point. Do not include patent overlaps. Only include the most relevant examples for each category.

<context>\n{json.dumps(combined_context, indent=2)}\n</context>
<debate_results>\n{json.dumps(debate_results, indent=2)}\n</debate_results>
<feature_ideation>\n{json.dumps(feature_ideation, indent=2)}\n</feature_ideation>

Use the `competitive_intelligence` tool.
"""
        analysis_result = run_claude_tool(
            "competitive_intelligence",
            competitive_intel_tool,
            prompt
        )
        return jsonify({'phase': 'competitive_analysis', 'step': 'result', 'data': analysis_result})
    except Exception as e:
        print(f"Error in /competitive_analysis: {e}")
        return jsonify({'phase': 'competitive_analysis', 'step': 'result', 'error': str(e)}), 500

# === Phase 6: MVP Roadmap ===
@app.route('/api/brainstorm/mvp_roadmap', methods=['POST'])
def get_mvp_roadmap():
    data = request.get_json()
    combined_context = data.get('combined_context')
    debate_results = data.get('debate_results')
    feature_ideation = data.get('feature_ideation')
    competitive_analysis = data.get('competitive_analysis')
    if not combined_context or not debate_results or not feature_ideation or not competitive_analysis:
        return jsonify({"error": "Missing 'combined_context', 'debate_results', 'feature_ideation', or 'competitive_analysis' in request body"}), 400

    try:
        # Updated prompt to emphasize conciseness and realism for MVP
        prompt = f"""You are a Roadmap & Action Plan Agent. Given all previous context, debate results, feature ideation, and competitive analysis, produce:
- **MVP Architecture Overview:** Keep this high-level, focusing on core components.
- **Implementation Plan:** Outline key milestones, essential toolkits/tech, and realistic hiring needs for an *initial* MVP. Avoid overly detailed long-term plans.
- **Technical Validation:** Briefly confirm the core technical feasibility.
- **Collaboration Notes:** Note key points for Feature Agent alignment on MVP scope.

**Focus on a *Minimum* Viable Product.** Keep the architecture and plan concise and grounded. Provide realistic, high-level estimates suitable for an initial MVP launch, avoiding excessively large figures unless strongly justified by the input context.

<context>\n{json.dumps(combined_context, indent=2)}\n</context>
<debate_results>\n{json.dumps(debate_results, indent=2)}\n</debate_results>
<feature_ideation>\n{json.dumps(feature_ideation, indent=2)}\n</feature_ideation>
<competitive_analysis>\n{json.dumps(competitive_analysis, indent=2)}\n</competitive_analysis>

Use the `mvp_roadmap` tool.
"""
        roadmap_result = run_claude_tool(
            "mvp_roadmap",
            roadmap_tool,
            prompt
        )
        return jsonify({'phase': 'mvp_roadmap', 'step': 'result', 'data': roadmap_result})
    except Exception as e:
        print(f"Error in /mvp_roadmap: {e}")
        return jsonify({'phase': 'mvp_roadmap', 'step': 'result', 'error': str(e)}), 500


# === Phase 7: Report Generation ===

# New endpoint for generating the full report
@app.route('/api/brainstorm/report/generate_full', methods=['POST'])
def generate_full_report():
    data = request.get_json()
    combined_context = data.get('combined_context') # Expect full context

    if not combined_context:
        return jsonify({"error": "Missing 'combined_context' in request body"}), 400

    # Construct a comprehensive context string for the prompt
    report_context_str = f"""
Selected Idea/Core Problem: {combined_context.get('core_problem', 'N/A')}
Initial Context & Refinement: {json.dumps(combined_context.get('context', {}), indent=2)}
Research Summary: {json.dumps(combined_context.get('research_summary', {}), indent=2)}
Debate Summary/Log: {json.dumps(combined_context.get('debate_log', []), indent=2)}
Feature Ideation: {json.dumps(combined_context.get('feature_ideation', {}), indent=2)}
Competitive Analysis: {json.dumps(combined_context.get('competitive_analysis', {}), indent=2)}
MVP Roadmap: {json.dumps(combined_context.get('mvp_roadmap', {}), indent=2)}
"""

    try:
        # Updated prompt with explicit detail, section requirements, emoji request, MVP simplification, table request, and TL;DRs
        prompt = f"""
Generate an extremely detailed, engaging, and highly readable final brainstorm report. Your goal is to synthesize all provided information into a cohesive, actionable, and visually appealing document. Be insightful, draw deep connections between the different phases (refinement, research, debate, features, market, roadmap).

## 📐 Formatting & Readability Requirements
- Use excellent **markdown formatting**: clear section headings (##), lists, tables, and callouts where appropriate.
- Add a **bolded TL;DR** after each major section (e.g., `**TL;DR:** ...`) with a 1-2 sentence summary.
- include emojis (✨, 🎯, 💡, 🚀, 💰, 📈, 🤔, ✅, and a lot more.) to highlight ideas and make it more engaging while keeping it professional.
- Use **callouts** (`> **Note:** ...`) for warnings, caveats, or standout insights.
- Use **tables** for structured data like feature lists, SWOT, or competitor comparisons.
- Write in **concise paragraphs and bullet points** to improve readability and scan-ability.
- The report must feel well-organized, actionable, and tailored for busy stakeholders.
- Make sure that the report is **engaging and easy to read**.

## 📄 Required Sections
1. **Executive Summary**
2. **Problem Definition & Refinement**
3. **Idea Exploration & Selection**
4. **Research Insights**
5. **Debate Perspectives**
6. **Feature Ideation & Prioritization** (with markdown table)
7. **Competitive & Gap Analysis** (include SWOT and competitor tables)
8. **MVP Design & Execution Blueprint**
9. **Conclusion & Next Steps**

---

## 🧠 Example Report Structure (Use this as formatting guide)

```markdown
## 🚀 Executive Summary
**TL;DR:** We're tackling [core problem] by building a lean MVP that offers [key value proposition] to [target audience].

* **Problem:** Users struggle with ...
* **Solution:** We propose ...
* **Key Insights:** Market gap in X, strong user signal from Y
* **MVP:** Focused on 3 core features: A, B, C

---

## 🔍 Problem Definition & Refinement
Users today face [context]. Through stakeholder interviews and scoping, we refined the original idea into a sharper core problem:

> **Final Problem Statement:** _"How might we help [target user] achieve [goal] without [pain point]?"_

**Constraints:**
- Time budget: 3 months
- Team: 1 PM, 1 designer, 2 engineers

**TL;DR:** Narrowed scope to focus on solving [X] for [Y] users under [Z] constraints.

---

## 💡 Idea Exploration & Selection
We explored several approaches:

| Idea | Pros | Cons |
|------|------|------|
| Self-serve tool | Scalable, low touch | Requires upfront trust |
| AI assistant | High UX value | Complex to build |

We chose **Self-serve tool** due to simplicity and time-to-market.

**TL;DR:** Chose simplest idea with strong signal and clear path to MVP.

---

## 📊 Research Insights

**User Interviews:**
- "I waste hours tracking this manually."
- "I'd pay for something that just works."

**Market Findings:**
- $1.2B annual spend in adjacent tools
- Key competitors are weak in automation

> **Note:** Most current tools are built for enterprises, not indie creators.

**TL;DR:** Users crave simplicity. Market opportunity exists in the long tail.

---

## 🤔 Debate Perspectives

| Position | Argument |
|----------|----------|
| For | Fast to build, fits timeline |
| Against | Too generic, no moat |

After team discussion, we agreed to validate with a prototype.

**TL;DR:** Debate clarified direction: go fast, test quickly, learn.

---

## ⚙️ Feature Ideation & Prioritization

| Feature | Must-Have | Nice-to-Have | Feasibility Notes |
|---------|-----------|--------------|-------------------|
| Dashboard | ✅ |  | Easy to implement |
| Export to PDF |  | ✅ | Requires 3rd-party lib |
| Auto-tagging | ✅ |  | Medium complexity |

**TL;DR:** Focus MVP on 3 features: dashboard, tagging, and insights.

---

## 🧩 Competitive & Gap Analysis

**Competitor Table:**

| Competitor | Strengths | Weaknesses | Pricing |
|------------|-----------|------------|---------|
| Tool A | UX polish | Expensive | $29/mo |
| Tool B | Flexible | Poor onboarding | $15/mo |

**SWOT Summary:**

| Strengths | Weaknesses |
|-----------|------------|
| Fast to build | Narrow niche |
| Focused UX | Limited integrations |

| Opportunities | Threats |
|---------------|---------|
| Underserved indie market | Bigger players entering space |
| Rising creator economy | High churn risk |

**TL;DR:** Room to win with simplicity and focus.

---

## 🛠 MVP Blueprint

**Scope:**
- Dashboard with tagging
- Simple onboarding
- Export option

**Tech Stack:**
- Frontend: React + Tailwind
- Backend: Firebase
- Timeline: 10 weeks

**Budget:**
- ~$25k for initial build

**TL;DR:** Lean build, fast to market, sets foundation for v2.

---

## ✅ Conclusion & Next Steps

* **Why it matters:** Helps [user] solve [problem] in a new, simpler way.
* **What's next:**
  1. Build prototype (2 weeks)
  2. Run 5 user tests
  3. Launch MVP in private beta

**TL;DR:** High-impact, low-risk idea. Let's build and test fast.
```

<report_context>
{report_context_str}
</report_context>

Use the `generate_full_report` tool to output the complete report content in the 'full_report_content' field.
"""
        report_result = run_claude_tool(
            "generate_full_report",
            full_report_tool, # Use the new tool schema
            prompt
        )

        # Ensure a fallback if the tool fails or returns empty content
        if not report_result or not report_result.get("full_report_content"):
             error_message = "Error: Full report generation failed. The model did not return content. Please review the context and try again."
             import sys
             print(error_message, file=sys.stderr) # Print to stderr
             sys.stderr.flush() # Force flush
             return jsonify({'phase': 'report', 'step': 'full_report', 'error': error_message}), 500
        else:
            report_content = report_result.get('full_report_content')

        # Return the full report content
        return jsonify({'phase': 'report', 'step': 'full_report', 'data': report_content})

    except Exception as e:
        error_message = f"Error generating full report: {e}"
        import sys
        print(error_message, file=sys.stderr) # Print to stderr
        sys.stderr.flush() # Force flush
        # Return error
        return jsonify({'phase': 'report', 'step': 'full_report', 'error': error_message}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)
