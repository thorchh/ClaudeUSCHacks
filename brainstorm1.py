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

<context>\n{json.dumps(combined_context, indent=2)}\n</context>
"""
)
creative_variants = creative_expansion.get("scamper_variations", [])

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

<context>\n{json.dumps(combined_context, indent=2)}\n</context>
<core_problem>\n{core_problem}\n</core_problem>
"""
)
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
# ...continue with next round as needed...
