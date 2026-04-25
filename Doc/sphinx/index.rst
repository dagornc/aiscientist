Autosearch — AI Scientist
=========================

.. toctree::
   :maxdepth: 2

   getting_started
   architecture
   api_reference


Getting Started
===============

Installation
------------

1. Clone the repository:

.. code-block:: bash

   git clone https://github.com/your-username/aiscientist.git
   cd aiscientist

2. Run the setup script:

.. code-block:: bash

   bash Cmd/setup_env.sh

3. Start the application:

.. code-block:: bash

   bash start.sh


Architecture
============

Autosearch implements the AI Scientist pipeline from Sakana AI with four phases:

1. **Idea Generation** — LLM-powered brainstorming with novelty checking
2. **Experimental Iteration** — Automated code generation and sandboxed execution
3. **Paper Write-up** — LaTeX manuscript generation with citations
4. **Peer Review** — Automated reviewing with self-reflection iterations


API Reference
=============

.. automodule:: app.main
   :members:

.. automodule:: app.core.pipeline
   :members:

.. automodule:: app.services.idea_generator
   :members:

.. automodule:: app.services.experiment_runner
   :members:

.. automodule:: app.services.paper_writer
   :members:

.. automodule:: app.services.reviewer
   :members:
