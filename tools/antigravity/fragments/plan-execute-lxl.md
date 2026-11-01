- **L/XL overall:** orchestrate the work as separate agents (Antigravity has no task-orchestrator skill):
  1. Split the approved plan into subtasks. Mark which are independent and which depend on others.
  2. Run each subtask as its own agent conversation (Agent Manager or a subagent). Select the model from the subtask's tier in the matrix — the Google column, or the model of the same tier from another provider if it is available in Antigravity's model picker.
  3. Give every subtask agent the approved plan, its task, and the PSAI requirements it must meet: changelog entry for behavior changes, glossary terms, feature docs, no AI attribution in commits.
  4. Run independent subtasks in parallel, dependent ones in order.
  5. Before committing, have a fresh agent on a top-tier model that did not write the code review the combined result against the plan.
