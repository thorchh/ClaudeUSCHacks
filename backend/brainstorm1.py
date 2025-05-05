from anthropic import Anthropic
import json
import os

# Initialize the client with an API key
# You should set this as an environment variable in your development environment
# api_key = os.environ.get("ANTHROPIC_API_KEY")
# if not api_key:
#     raise ValueError("ANTHROPIC_API_KEY environment variable not set")

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
    response = client.messages.create(
        model=MODEL,
        max_tokens=1024,
        tools=tool_schema,
        tool_choice={"type": "tool", "name": tool_name},
        messages=[{"role": "user", "content": query}]
    )
    for content in response.content:
        if content.type == "tool_use" and content.name == tool_name:
            return content.input
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

themes = run_claude_tool(
    "extract_themes",
    theme_tool,
    f"""Extract themes from the following text and use the `extract_themes` tool.

<freewriting>
{freewriting}
</freewriting>
"""
)
print("Emergent Themes:\n", themes)

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

context_input = run_claude_tool(
    "intake_context",
    context_tool,
    f"""Simulate the intake context step for someone trying to solve the problem described in this brainstorming text.

<freewriting>
{freewriting}
</freewriting>

Now use the `intake_context` tool to summarize goal, audience, and constraints.
"""
)
print("Structured Context:\n", context_input)

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

clarification = run_claude_tool(
    "clarify_concept",
    clarification_tool,
    f"""You are a concept clarification agent. Parse the following context for keywords, objectives, and assumptions. If any important detail is missing or ambiguous, set 'need_more_detail' to true and ask a specific follow-up question in 'missing_detail_question'. Otherwise, set 'need_more_detail' to false.

<context>
{json.dumps(context_input, indent=2)}
</context>

Use the `clarify_concept` tool to respond.
"""
)
print("Concept Clarification:\n", json.dumps(clarification, indent=2))

if clarification.get("need_more_detail"):
    default_detail_answer = (
        "Use sender role, keywords, and explicit deadline dates to determine urgency."
    )
    print("Using default_detail_answer:", default_detail_answer)
else:
    default_detail_answer = ""

# === Step 2: Initial Pushback (user can respond) ===
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

pushback = run_claude_tool(
    "constructive_pushback",
    constructive_pushback_tool,
    f"""Given the following context and themes, summarize the most important risks or blindspots (1–2 sentences), then ask a supportive, curiosity-driven question.

<context>
{json.dumps(context_input, indent=2)}
</context>
<themes>
{json.dumps(themes['themes'], indent=2)}
</themes>

Use the `constructive_pushback` tool to respond.
"""
)
print("\nPushback Summary:\n", pushback["summary_of_pushback"])
print("\nCuriosity-Driven Question:\n", pushback["curiosity_question"])

default_pushback_response = (
    "I think Google integration is most critical, and AI-driven onboarding will minimize user effort."
)
print("\nUsing default_pushback_response:", default_pushback_response)

# Define combined_context before using it in creativity/cross-pollination steps
combined_context = {
    "context": context_input,
    "clarification": clarification,
    "detail_answer": default_detail_answer,
    "pushback_summary": pushback["summary_of_pushback"],
    "curiosity_question": pushback["curiosity_question"],
    "pushback_response": default_pushback_response
}

# === Step 2.5: Generate Core Problem Statement with Claude ===
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

core_problem_result = run_claude_tool(
    "summarize_core_problem",
    core_problem_tool,
    f"""Given the following context and clarification, summarize the core problem, user pain, and constraints in a concise, actionable way. This summary will be used to anchor all downstream idea generation prompts, so make it practical and specific to the user's needs.

<context>\n{json.dumps(context_input, indent=2)}\n</context>
<clarification>\n{json.dumps(clarification, indent=2)}\n</clarification>
"""
)
core_problem = core_problem_result["core_problem"]

# === Step 3: Creativity Layer + Cross-Pollination ===
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

creative_expansion = run_claude_tool(
    "meta_creativity",
    meta_creativity_tool,
    f"""You are a meta-creative agent. Expand on the original idea below, but do NOT stray from the core problem:
{core_problem}

Apply each of the following frameworks to generate practical, actionable, and relevant variations or insights for the original feedback management problem:
- SCAMPER (Substitute, Combine, Adapt, Modify, Put to another use, Eliminate, Reverse)
- First Principles decomposition
- Phenomenological inquiry (describe the user's lived experience and pain)
- Six Thinking Hats (summarize the idea from each hat's perspective)

All outputs must be tightly relevant to the user's context and pain points.

Limit the number of SCAMPER variations to 3.

For each SCAMPER variation, use structured chain-of-thought reasoning. Output your reasoning in <thinking> tags and the final idea in <answer> tags. Think step-by-step, breaking down the problem and solution in detail.

<context>\n{json.dumps(combined_context, indent=2)}\n</context>
"""
)

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

cross_analogs = run_claude_tool(
    "cross_pollination",
    cross_pollination_tool,
    f"""You are an innovation agent. Using the core problem below, generate practical, actionable, and relevant idea variants for feedback management by:
- Drawing analogies from other industries (cross-industry analogies)
- Proposing hybrid concepts that combine the original idea with proven solutions from other domains
- Applying meta-trend inspirations (e.g., async collaboration, quantified self, etc.)
- Remixing business model patterns

All outputs must be tightly relevant to the user's context and pain points, and should not stray from the core problem.

Limit the number of hybrid concepts to 3.

For each hybrid concept, use structured chain-of-thought reasoning. Output your reasoning in <thinking> tags and the final idea in <answer> tags. Think step-by-step, breaking down the problem and solution in detail.

<context>\n{json.dumps(combined_context, indent=2)}\n</context>
<core_problem>\n{core_problem}\n</core_problem>
"""
)

creative_variants = creative_expansion.get("scamper_variations", [])
cross_variants = cross_analogs.get("hybrid_concepts", [])

all_idea_variants = creative_variants + cross_variants

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

# === Step 4: Pushback + Feasibility for Each Variant ===
variant_results = []
for idx, idea in enumerate(all_idea_variants):
    # Pushback (for display only)
    variant_pushback = run_claude_tool(
        "constructive_pushback",
        constructive_pushback_tool,
        f"""Given the following idea variant, summarize the most important risks or blindspots (1–2 sentences), then ask a curiosity-driven question (for display only, not for user response).

<idea>\n{idea}\n</idea>
"""
    )
    # Feasibility
    variant_context = {
        "context": context_input,
        "clarification": clarification,
        "detail_answer": default_detail_answer,
        "idea_variant": idea
    }
    variant_feasibility = run_claude_tool(
        "score_feasibility",
        feasibility_tool,
        f"""Score the feasibility of the following idea variant.

<context>\n{json.dumps(variant_context, indent=2)}\n</context>
<idea>\n{idea}\n</idea>
"""
    )
    variant_results.append({
        "idea": idea,
        "pushback": variant_pushback,
        "feasibility": variant_feasibility
    })

# === Step 5: Present All Ideas for User Selection ===
print("\nIDEA VARIANTS WITH PUSHBACK & FEASIBILITY:\n")
for idx, result in enumerate(variant_results):
    print(f"[{idx+1}] Idea: {result['idea']}")
    print(f"    Pushback: {result['pushback']['summary_of_pushback']}")
    print(f"    Feasibility: {json.dumps(result['feasibility'], indent=2)}\n")

selected_idx = int(input("Select the number of the idea you want to continue with: ")) - 1
selected_idea = variant_results[selected_idx]['idea']
print(f"\nYou selected: {selected_idea}\n")

# === Step 5: Research Layer: Real-Time Knowledge Integration (after idea selection) ===
research_agents = [
    {
        "name": "market_intelligence",
        "description": "Pulls news, social sentiment, patent filings, startup funding, identifies hype/traction mismatch, under-discussed trends, and behavioral data correlations.",
        "input_schema": {
            "type": "object",
            "properties": {
                "news_insights": {"type": "array", "items": {"type": "string"}},
                "social_sentiment": {"type": "array", "items": {"type": "string"}},
                "patent_trends": {"type": "array", "items": {"type": "string"}},
                "startup_activity": {"type": "array", "items": {"type": "string"}},
                "hype_vs_traction": {"type": "string"},
                "under_discussed_trends": {"type": "array", "items": {"type": "string"}},
                "behavioral_correlations": {"type": "array", "items": {"type": "string"}}
            },
            "required": ["news_insights", "social_sentiment", "patent_trends", "startup_activity", "hype_vs_traction", "under_discussed_trends", "behavioral_correlations"]
        }
    },
    {
        "name": "competitive_analysis",
        "description": "Scans for competitors, SWOT, saturation, business models, and outputs opportunity gaps with justification.",
        "input_schema": {
            "type": "object",
            "properties": {
                "direct_competitors": {"type": "array", "items": {"type": "string"}},
                "indirect_competitors": {"type": "array", "items": {"type": "string"}},
                "swot_profiles": {"type": "array", "items": {"type": "string"}},
                "saturation_map": {"type": "string"},
                "business_model_archetypes": {"type": "array", "items": {"type": "string"}},
                "opportunity_gaps": {"type": "array", "items": {"type": "string"}}
            },
            "required": ["direct_competitors", "indirect_competitors", "swot_profiles", "saturation_map", "business_model_archetypes", "opportunity_gaps"]
        }
    },
    {
        "name": "analogical_synthesis",
        "description": "Performs lateral ideation via cross-industry inspiration, business model remixing, metaphorical mutation, and proposes 3–5 hybrid concepts with justification.",
        "input_schema": {
            "type": "object",
            "properties": {
                "hybrid_concepts": {"type": "array", "items": {"type": "string"}},
                "structure_mapping": {"type": "string"},
                "causal_layered_analysis": {"type": "string"},
                "justifications": {"type": "array", "items": {"type": "string"}}
            },
            "required": ["hybrid_concepts", "structure_mapping", "causal_layered_analysis", "justifications"]
        }
    },
    {
        "name": "contrarian_research",
        "description": "Hunts disconfirming data: market pullbacks, critical press, early adopter resistance, ensures robustness and anti-echo-chamber integrity.",
        "input_schema": {
            "type": "object",
            "properties": {
                "disconfirming_data": {"type": "array", "items": {"type": "string"}},
                "critical_press": {"type": "array", "items": {"type": "string"}},
                "adopter_resistance": {"type": "array", "items": {"type": "string"}},
                "robustness_notes": {"type": "string"}
            },
            "required": ["disconfirming_data", "critical_press", "adopter_resistance", "robustness_notes"]
        }
    }
    # Add more agents here (e.g., psychology, economics, technology, trends) as needed
]

research_results = {agent["name"]: [] for agent in research_agents}
for i in range(3):
    for agent in research_agents:
        result = run_claude_tool(
            agent["name"],
            [agent],
            f"""You are the {agent['name'].replace('_', ' ').title()} Agent. Given the following idea and context, perform your research and output your top insights for this round. Do not search the internet; use your own reasoning and knowledge. Be concise, relevant, and insightful. This is round {i+1} of 3.

<idea>\n{selected_idea}\n</idea>
<context>\n{json.dumps(combined_context, indent=2)}\n</context>
"""
        )
        research_results[agent["name"]].append(result)

print("\n=== Research Layer Results ===\n")
for agent, result in research_results.items():
    print(f"--- {agent.replace('_', ' ').title()} ---\n", json.dumps(result, indent=2))

# Summarize all research results for debate context
research_summary_tool = [{
    "name": "summarize_research_context",
    "description": "Summarizes all research agent findings into a concise, actionable context for debate agents.",
    "input_schema": {
        "type": "object",
        "properties": {
            "research_summary": {"type": "string"}
        },
        "required": ["research_summary"]
    }
}]

research_summary = run_claude_tool(
    "summarize_research_context",
    research_summary_tool,
    f"""Summarize the following research agent findings into a concise, actionable context for debate agents. Highlight the most important insights, risks, and opportunities relevant to the selected idea.

<research_results>\n{json.dumps(research_results, indent=2)}\n</research_results>
<idea>\n{selected_idea}\n</idea>
"""
)["research_summary"]

# Pass summarized research into the debate agents as context

# === Step 6: Multi-Agent Dialectical Debate (Delphi-Style) ===

# Define agent roles and modular agent logic
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

# Store agent states for each round
agent_states = {role: {} for role in AGENT_ROLES}

for round_num in range(1, 4):
    print(f"\n=== Debate Round {round_num} ===\n")
    round_outputs = {}
    for agent in AGENT_ROLES:
        other_feedback = [agent_states[other]["insight"] for other in AGENT_ROLES if other != agent and "insight" in agent_states[other]]
        debate_prompt = f"""{AGENT_PROMPTS[agent]}
\nDebate the following idea:
<idea>\n{selected_idea}\n</idea>
<research_summary>\n{research_summary}\n</research_summary>
Here is anonymized feedback from other agents:
{json.dumps(other_feedback, indent=2)}

At the start of this round, review all critiques and new evidence. Use structured chain-of-thought reasoning: output your step-by-step thinking in <thinking> tags and your final position in <answer> tags. If your vote or weight does not change, you must justify why. If you do change, explain what specifically caused the change. Only assign a high empirical weight if you cite concrete data, studies, or real-world examples; otherwise, use a lower weight. Do not default to 7 or 0.8—your score should reflect your true, updated position. Output a short 'change_log' describing any change in your vote/weight and why it happened (or why it did not). Output your full chain of thought as 'chain_of_thought'.
"""
        agent_output = run_claude_tool(
            "agent_debate_round",
            agent_debate_tool,
            debate_prompt
        )
        round_outputs[agent] = agent_output
        agent_states[agent] = agent_output
    print(f"\n--- Round {round_num} Results ---\n")
    for agent, output in round_outputs.items():
        print(f"{agent}:\n  Insight: {output.get('insight', '[missing]')}\n  Critiques: {output.get('critiques', '[missing]')}\n  Vote: {output.get('vote', '[missing]')} (weight: {output.get('empirical_weight', '[missing]')})\n  Change Log: {output.get('change_log', '[missing]')}\n  Chain of Thought: {output.get('chain_of_thought', '[missing]')}\n")

# === User Check-in ===
while True:
    user_input = input("On a scale of 1-5, how confident are you in the emerging results? ")
    try:
        user_confidence = int(user_input)
        if 1 <= user_confidence <= 5:
            break
        else:
            print("Please enter a number between 1 and 5.")
    except ValueError:
        print("Please enter a valid integer between 1 and 5.")

if user_confidence < 4:
    print("\nConfidence is low. Triggering targeted reanalysis in the next round...\n")
    # Optionally, you could re-run the last round with a new prompt or more focus.
    print("Re-running the last debate round with a targeted reanalysis prompt...\n")
    targeted_prompt = "Focus specifically on the main sources of uncertainty or disagreement from previous rounds. What are the biggest unknowns or risks, and what additional evidence or clarification would help resolve them?"
    round_outputs = {}
    for agent in AGENT_ROLES:
        other_feedback = [agent_states[other]["insight"] for other in AGENT_ROLES if other != agent and "insight" in agent_states[other]]
        debate_prompt = f"""{AGENT_PROMPTS[agent]}
\nTARGETED REANALYSIS: {targeted_prompt}
Debate the following idea:
<idea>\n{selected_idea}\n</idea>
Here is anonymized feedback from other agents:
{json.dumps(other_feedback, indent=2)}
"""
        agent_output = run_claude_tool(
            "agent_debate_round",
            agent_debate_tool,
            debate_prompt
        )
        round_outputs[agent] = agent_output
        agent_states[agent] = agent_output
    print(f"\n--- Targeted Reanalysis Results ---\n")
    for agent, output in round_outputs.items():
        print(f"{agent}:\n  Insight: {output.get('insight', '[missing]')}\n  Critiques: {output.get('critiques', '[missing]')}\n  Vote: {output.get('vote', '[missing]')} (weight: {output.get('empirical_weight', '[missing]')})\n  Change Log: {output.get('change_log', '[missing]')}\n  Chain of Thought: {output.get('chain_of_thought', '[missing]')}\n")
else:
    print("\nDebate complete. Proceeding with synthesis of results.\n")

# Synthesize final results (simple example: aggregate insights and votes)
print("\n=== Final Synthesized Debate Results ===\n")
for agent, output in agent_states.items():
    print(f"{agent}:\n  Final Insight: {output.get('insight', '[missing]')}\n  Final Vote: {output.get('vote', '[missing]')} (weight: {output.get('empirical_weight', '[missing]')})\n  Change Log: {output.get('change_log', '[missing]')}\n  Chain of Thought: {output.get('chain_of_thought', '[missing]')}\n")

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

feature_ideation = run_claude_tool(
    "feature_ideation",
    feature_ideation_tool,
    f"""You are a Feature Ideation Agent. Given all previous context, debate results, and user feedback, generate:
- Must-have vs nice-to-have features
- Feasibility & technical complexity
- Rough cost & time estimates
- Suggested feature pivots based on user feedback and debate

<context>\n{json.dumps(combined_context, indent=2)}\n</context>
<debate_results>\n{json.dumps(agent_states, indent=2)}\n</debate_results>
"""
)
print("\n=== Feature Ideation & Prioritization ===\n", json.dumps(feature_ideation, indent=2))

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

competitive_analysis = run_claude_tool(
    "competitive_intelligence",
    competitive_intel_tool,
    f"""You are a Competitive Intelligence Agent. Given all previous context, debate results, and feature ideation, map:
- 3-6 direct and indirect competitors
- 3-6 Blue Ocean gaps
- 3-6 SWOT profiles
- 3-6 underserved segments and emerging players

Be concise and to the point. Do not include patent overlaps. Only include the most relevant examples for each category.

<context>\n{json.dumps(combined_context, indent=2)}\n</context>
<debate_results>\n{json.dumps(agent_states, indent=2)}\n</debate_results>
<feature_ideation>\n{json.dumps(feature_ideation, indent=2)}\n</feature_ideation>
"""
)
print("\n=== Competitive & Gap Analysis ===\n", json.dumps(competitive_analysis, indent=2))

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

mvp_roadmap = run_claude_tool(
    "mvp_roadmap",
    roadmap_tool,
    f"""You are a Roadmap & Action Plan Agent. Given all previous context, debate results, feature ideation, and competitive analysis, produce:
- MVP Architecture Overview
- Implementation plan (milestones, toolkits, hiring needs)
- Technical validation layer
- Collaboration notes with Feature Agent to ensure MVP realism

<context>\n{json.dumps(combined_context, indent=2)}\n</context>
<debate_results>\n{json.dumps(agent_states, indent=2)}\n</debate_results>
<feature_ideation>\n{json.dumps(feature_ideation, indent=2)}\n</feature_ideation>
<competitive_analysis>\n{json.dumps(competitive_analysis, indent=2)}\n</competitive_analysis>
"""
)
print("\n=== MVP Design & Execution Blueprint ===\n", json.dumps(mvp_roadmap, indent=2))

# === Final Report ===
print("\n=== FINAL REPORT ===\n")
print("\n--- Feature Ideation & Prioritization (Top 3-6) ---\n", json.dumps({
    'must_have_features': feature_ideation['must_have_features'][:6],
    'nice_to_have_features': feature_ideation['nice_to_have_features'][:6],
    'feasibility_notes': feature_ideation['feasibility_notes'],
    'technical_complexity': feature_ideation['technical_complexity'],
    'cost_time_estimates': feature_ideation['cost_time_estimates'],
    'feature_pivots': feature_ideation['feature_pivots'][:6]
}, indent=2))
print("\n--- Competitive & Gap Analysis (Top 3-6) ---\n", json.dumps({
    'direct_competitors': competitive_analysis['direct_competitors'][:6],
    'indirect_competitors': competitive_analysis['indirect_competitors'][:6],
    'blue_ocean_gaps': competitive_analysis['blue_ocean_gaps'][:6],
    'swot_profiles': competitive_analysis['swot_profiles'][:6],
    'underserved_segments': competitive_analysis['underserved_segments'][:6],
    'emerging_players': competitive_analysis['emerging_players'][:6]
}, indent=2))
print("\n--- MVP Design & Execution Blueprint ---\n", json.dumps(mvp_roadmap, indent=2))
