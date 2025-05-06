# backend/brainstorm_client.py
import requests
import json

# --- Configuration ---
BASE_URL = "http://127.0.0.1:5000/api/brainstorm" # Assuming Flask runs locally on port 5000

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

# --- Helper Function ---
def call_api(endpoint, payload):
    """Calls a POST endpoint on the Flask server."""
    url = f"{BASE_URL}{endpoint}"
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status() # Raise an exception for bad status codes (4xx or 5xx)
        result = response.json()
        if 'data' in result:
            return result['data']
        else:
            print(f"Warning: 'data' key not found in response from {endpoint}. Full response: {result}")
            return result # Return full response if 'data' key is missing
    except requests.exceptions.RequestException as e:
        print(f"Error calling API endpoint {endpoint}: {e}")
        print(f"Response status: {response.status_code if 'response' in locals() else 'N/A'}")
        print(f"Response text: {response.text if 'response' in locals() else 'N/A'}")
        return None # Indicate failure

# --- Main Script Logic ---

# === Step 1: Intake ===
print("--- Step 1: Intake ---")
themes_payload = {"freewriting": freewriting}
themes = call_api("/refine/themes", themes_payload)
if themes: print("Emergent Themes:\n", themes)

context_payload = {"freewriting": freewriting}
context_input = call_api("/refine/context", context_payload)
if context_input: print("Structured Context:\n", context_input)

clarification_payload = {"context_input": context_input}
clarification = call_api("/refine/clarification", clarification_payload)
if clarification: print("Concept Clarification:\n", json.dumps(clarification, indent=2))

default_detail_answer = ""
if clarification and clarification.get("need_more_detail"):
    default_detail_answer = "Use sender role, keywords, and explicit deadline dates to determine urgency."
    print("Using default_detail_answer:", default_detail_answer)

# === Step 2: Initial Pushback ===
print("\n--- Step 2: Initial Pushback ---")
pushback_payload = {"context_input": context_input, "themes": themes}
pushback = call_api("/refine/pushback", pushback_payload)
if pushback:
    print("\nPushback Summary:\n", pushback.get("summary_of_pushback", "[missing]"))
    print("\nCuriosity-Driven Question:\n", pushback.get("curiosity_question", "[missing]"))

default_pushback_response = "I think Google integration is most critical, and AI-driven onboarding will minimize user effort."
print("\nUsing default_pushback_response:", default_pushback_response)

# Combine context for later steps
combined_context = {
    "context": context_input,
    "clarification": clarification,
    "detail_answer": default_detail_answer,
    "pushback_summary": pushback.get("summary_of_pushback") if pushback else None,
    "curiosity_question": pushback.get("curiosity_question") if pushback else None,
    "pushback_response": default_pushback_response
}

# === Step 2.5: Generate Core Problem Statement ===
print("\n--- Step 2.5: Core Problem ---")
core_problem_payload = {"context_input": context_input, "clarification": clarification}
# The API returns the core problem string directly in the 'data' field
core_problem = call_api("/refine/core_problem", core_problem_payload)
if core_problem: print("Core Problem:\n", core_problem)

# === Step 3: Creativity Layer + Cross-Pollination ===
print("\n--- Step 3: Creativity & Cross-Pollination ---")
creative_payload = {"core_problem": core_problem, "combined_context": combined_context}
creative_expansion = call_api("/refine/creative_expansion", creative_payload)

cross_payload = {"core_problem": core_problem, "combined_context": combined_context}
cross_analogs = call_api("/refine/cross_analogs", cross_payload)

creative_variants = creative_expansion.get("scamper_variations", []) if creative_expansion else []
cross_variants = cross_analogs.get("hybrid_concepts", []) if cross_analogs else []
all_idea_variants = creative_variants + cross_variants
print(f"Generated {len(all_idea_variants)} idea variants.")

# === Step 4: Pushback + Feasibility for Each Variant ===
print("\n--- Step 4: Variant Pushback & Feasibility ---")
variant_results = []
for idx, idea in enumerate(all_idea_variants):
    print(f"Processing variant {idx+1}...")
    # Pushback
    variant_pushback_payload = {"idea_variant": idea}
    variant_pushback = call_api("/refine/variant_pushback", variant_pushback_payload)

    # Feasibility
    variant_context = {
        "context": context_input,
        "clarification": clarification,
        "detail_answer": default_detail_answer,
        "idea_variant": idea
    }
    variant_feasibility_payload = {"idea_variant": idea, "variant_context": variant_context}
    variant_feasibility = call_api("/refine/variant_feasibility", variant_feasibility_payload)

    variant_results.append({
        "idea": idea,
        "pushback": variant_pushback,
        "feasibility": variant_feasibility
    })

# === Step 5: Present All Ideas for User Selection ===
print("\n--- Step 5: Select Idea ---")
print("\nIDEA VARIANTS WITH PUSHBACK & FEASIBILITY:\n")
for idx, result in enumerate(variant_results):
    print(f"[{idx+1}] Idea: {result.get('idea', '[missing]')}")
    pushback_summary = result.get('pushback', {}).get('summary_of_pushback', '[missing]')
    print(f"    Pushback: {pushback_summary}")
    feasibility_str = json.dumps(result.get('feasibility', {}), indent=4)
    print(f"    Feasibility: {feasibility_str}\n")

selected_idx = -1
while selected_idx < 0 or selected_idx >= len(variant_results):
    try:
        raw_input = input(f"Select the number of the idea you want to continue with (1-{len(variant_results)}): ")
        selected_idx = int(raw_input) - 1
        if selected_idx < 0 or selected_idx >= len(variant_results):
            print("Invalid selection. Please enter a number within the range.")
    except ValueError:
        print("Invalid input. Please enter a number.")

selected_idea = variant_results[selected_idx]['idea']
print(f"\nYou selected: {selected_idea}\n")

# === Step 5: Research Layer ===
print("\n--- Step 5: Research Layer ---")
# Get available agents (optional, assumes we know them)
# available_agents_response = requests.get(f"{BASE_URL}/research/available_agents")
# available_agents = available_agents_response.json().get('data', [])
# print("Available research agents:", available_agents)

# Hardcode known agents based on brainstorm1.py
research_agent_names = [
    "market_intelligence",
    "competitive_analysis",
    "analogical_synthesis",
    "contrarian_research"
]

research_results = {agent_name: [] for agent_name in research_agent_names}
num_research_rounds = 3
for i in range(num_research_rounds):
    print(f"Research Round {i+1}/{num_research_rounds}...")
    for agent_name in research_agent_names:
        research_payload = {
            "selected_idea": selected_idea,
            "agent_name": agent_name,
            "combined_context": combined_context,
            "round_num": i + 1
        }
        result = call_api("/research/agent", research_payload)
        if result:
            research_results[agent_name].append(result)

print("\n=== Research Layer Results ===\n")
for agent, result_list in research_results.items():
    print(f"--- {agent.replace('_', ' ').title()} ---")
    for round_idx, result in enumerate(result_list):
         print(f"  Round {round_idx+1}: {json.dumps(result, indent=4)}")

# Summarize research
print("\nSummarizing research...")
summary_payload = {"research_results": research_results, "selected_idea": selected_idea}
research_summary_result = call_api("/research/summary", summary_payload)
research_summary = research_summary_result.get("research_summary", "Summary failed.") if research_summary_result else "Summary failed."
print("Research Summary:\n", research_summary)


# === Step 6: Multi-Agent Dialectical Debate ===
print("\n--- Step 6: Debate ---")
# Get available roles (optional, assumes we know them)
# available_roles_response = requests.get(f"{BASE_URL}/debate/available_roles")
# AGENT_ROLES = available_roles_response.json().get('data', [])
# print("Available debate roles:", AGENT_ROLES)

# Hardcode known roles based on brainstorm1.py
AGENT_ROLES = [
    "Market Agent",
    "Feature Agent",
    "Synthesis Agent",
    "Contrarian Agent",
    "Fusion Agent"
]

agent_states = {role: {} for role in AGENT_ROLES}
num_debate_rounds = 3

for round_num in range(1, num_debate_rounds + 1):
    print(f"\n=== Debate Round {round_num} ===\n")
    round_outputs = {}
    current_round_feedback = [] # Collect feedback within this round

    for agent_role in AGENT_ROLES:
        # Prepare feedback from *previous* states of other agents for this agent's turn
        other_feedback_for_agent = [
            state.get("insight", "[No insight provided]")
            for other_role, state in agent_states.items()
            if other_role != agent_role and state # Ensure state exists
        ]

        debate_payload = {
            "selected_idea": selected_idea,
            "research_summary": research_summary,
            "agent_role": agent_role,
            "other_feedback": other_feedback_for_agent, # Feedback from previous states
            "round_num": round_num
        }
        agent_output = call_api("/debate/round", debate_payload)

        if agent_output:
            round_outputs[agent_role] = agent_output
            # Collect the insight generated *in this round* to potentially feed to the *next* agent in *this same round*
            # (Note: The original script seemed to provide feedback from the *start* of the round.
            # Adjusting here to provide feedback generated *within* the current round for subsequent agents in the same round.
            # If feedback should only be from the *previous* round, use agent_states as done in the payload.)
            if "insight" in agent_output:
                 current_round_feedback.append(agent_output["insight"])
        else:
            print(f"Agent {agent_role} failed to respond in round {round_num}.")
            round_outputs[agent_role] = {} # Store empty dict on failure

    # Update agent_states *after* all agents have taken their turn in the round
    for agent_role, output in round_outputs.items():
         agent_states[agent_role] = output # Overwrite with the latest output for the next round

    print(f"\n--- Round {round_num} Results ---")
    for agent, output in round_outputs.items():
        print(f"{agent}:")
        print(f"  Insight: {output.get('insight', '[missing]')}")
        print(f"  Critiques: {output.get('critiques', '[missing]')}")
        print(f"  Vote: {output.get('vote', '[missing]')} (weight: {output.get('empirical_weight', '[missing]')})")
        print(f"  Change Log: {output.get('change_log', '[missing]')}")
        # print(f"  Chain of Thought: {output.get('chain_of_thought', '[missing]')}\n") # Often verbose

# === User Check-in (Simplified) ===
# Skipping the re-run logic for brevity, just collecting final states
print("\nDebate complete. Proceeding with synthesis of results.\n")
print("\n=== Final Synthesized Debate Results ===\n")
for agent, output in agent_states.items():
    print(f"{agent}:")
    print(f"  Final Insight: {output.get('insight', '[missing]')}")
    print(f"  Final Vote: {output.get('vote', '[missing]')} (weight: {output.get('empirical_weight', '[missing]')})")
    print(f"  Change Log: {output.get('change_log', '[missing]')}")
    # print(f"  Chain of Thought: {output.get('chain_of_thought', '[missing]')}\n") # Often verbose

# === Step 7: Feature Ideation & Prioritization ===
print("\n--- Step 7: Feature Ideation ---")
feature_payload = {
    "combined_context": combined_context,
    "debate_results": agent_states # Pass final agent states
}
feature_ideation = call_api("/feature_ideation", feature_payload)
if feature_ideation: print("\n=== Feature Ideation & Prioritization ===\n", json.dumps(feature_ideation, indent=2))

# === Step 8: Competitive & Gap Analysis ===
print("\n--- Step 8: Competitive Analysis ---")
competitive_payload = {
    "combined_context": combined_context,
    "debate_results": agent_states,
    "feature_ideation": feature_ideation
}
competitive_analysis = call_api("/competitive_analysis", competitive_payload)
if competitive_analysis: print("\n=== Competitive & Gap Analysis ===\n", json.dumps(competitive_analysis, indent=2))

# === Step 9: MVP Design & Execution Blueprint ===
print("\n--- Step 9: MVP Roadmap ---")
mvp_payload = {
    "combined_context": combined_context,
    "debate_results": agent_states,
    "feature_ideation": feature_ideation,
    "competitive_analysis": competitive_analysis
}
mvp_roadmap = call_api("/mvp_roadmap", mvp_payload)
if mvp_roadmap: print("\n=== MVP Design & Execution Blueprint ===\n", json.dumps(mvp_roadmap, indent=2))

# === Final Report (Simplified - just printing results) ===
print("\n--- FINAL REPORT (Data Gathered) ---")

if feature_ideation:
    print("\n--- Feature Ideation & Prioritization (Top 3-6) ---\n", json.dumps({
        'must_have_features': feature_ideation.get('must_have_features', [])[:6],
        'nice_to_have_features': feature_ideation.get('nice_to_have_features', [])[:6],
        'feasibility_notes': feature_ideation.get('feasibility_notes', ''),
        'technical_complexity': feature_ideation.get('technical_complexity', ''),
        'cost_time_estimates': feature_ideation.get('cost_time_estimates', ''),
        'feature_pivots': feature_ideation.get('feature_pivots', [])[:6]
    }, indent=2))
else:
    print("\n--- Feature Ideation & Prioritization: FAILED ---")

if competitive_analysis:
    print("\n--- Competitive & Gap Analysis (Top 3-6) ---\n", json.dumps({
        'direct_competitors': competitive_analysis.get('direct_competitors', [])[:6],
        'indirect_competitors': competitive_analysis.get('indirect_competitors', [])[:6],
        'blue_ocean_gaps': competitive_analysis.get('blue_ocean_gaps', [])[:6],
        'swot_profiles': competitive_analysis.get('swot_profiles', [])[:6],
        'underserved_segments': competitive_analysis.get('underserved_segments', [])[:6],
        'emerging_players': competitive_analysis.get('emerging_players', [])[:6]
    }, indent=2))
else:
     print("\n--- Competitive & Gap Analysis: FAILED ---")

if mvp_roadmap:
    print("\n--- MVP Design & Execution Blueprint ---\n", json.dumps(mvp_roadmap, indent=2))
else:
    print("\n--- MVP Design & Execution Blueprint: FAILED ---")

print("\n--- Script Finished ---")
