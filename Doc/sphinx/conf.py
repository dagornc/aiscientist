"""Sphinx configuration for Autosearch documentation."""

import os
import sys

sys.path.insert(0, os.path.abspath("../../Code/Backend"))

project = "Autosearch"
copyright = "2026, Autosearch Team"
author = "Autosearch Team"

extensions = [
    "sphinx.ext.autodoc",
    "sphinx.ext.napoleon",
    "sphinx.ext.viewcode",
    "sphinx.ext.intersphinx",
]

templates_path = ["_templates"]
exclude_patterns = ["_build"]

html_theme = "sphinx_rtd_theme"
html_static_path = ["_static"]

napoleon_google_docstring = True
napoleon_numpy_docstring = False
