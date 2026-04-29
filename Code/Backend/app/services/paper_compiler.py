"""PDF compilation service — compiles LaTeX sources to PDF files."""

from __future__ import annotations

import os
import subprocess
import tempfile
from pathlib import Path


def compile_latex(latex_source: str, output_dir: str) -> str:
    """Compile LaTeX source to PDF.
    
    Args:
        latex_source: The LaTeX source code as string.
        output_dir: Directory where the PDF should be saved.
    
    Returns:
        The path to the generated PDF file.
    
    Raises:
        RuntimeError: If compilation fails.
    """
    # Ensure output directory exists
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    
    # Create a temporary directory for TeX compilation
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)
        
        # Write LaTeX source to .tex file
        tex_file = temp_path / "temp.tex"
        with open(tex_file, "w", encoding="utf-8") as f:
            f.write(latex_source)
        
        # Ensure output_dir exists
        Path(output_dir).mkdir(parents=True, exist_ok=True)
        
        # Compile LaTeX to PDF
        # Use output directory as working dir and specify output file location
        pdf_filename = "compiled_paper.pdf"
        pdf_path = Path(output_dir) / pdf_filename
        
        try:
            # Run pdflatex command
            result = subprocess.run(
                [
                    "pdflatex",
                    "-interaction=nonstopmode",
                    "-output-directory",
                    str(temp_dir),
                    str(tex_file)
                ],
                capture_output=True,
                text=True,
                timeout=120  # 2 minute timeout
            )
            
            if result.returncode != 0:
                # Compilation failed, raise exception with error info
                raise RuntimeError(f"LaTeX compilation failed:\n{result.stderr}\n{result.stdout}")
            
            # Copy the generated PDF to the requested output directory
            generated_pdf = temp_path / "temp.pdf"
            if not generated_pdf.exists():
                # Try alternate naming (some versions might create differently named PDF)
                generated_pdf_alt = temp_path / "temp.output.pdf"
                
                # If neither exists, look for any PDF in the directory
                pdf_files = list(temp_path.glob("*.pdf"))
                if pdf_files:
                    generated_pdf = pdf_files[0]
                else:
                    raise RuntimeError("PDF file was not generated during LaTeX compilation")
            
            # Copy the compiled PDF to our intended destination
            with open(generated_pdf, "rb") as src, open(pdf_path, "wb") as dst:
                dst.write(src.read())
            
        except subprocess.TimeoutExpired:
            raise RuntimeError("LaTeX compilation timed out after 120 seconds")
        except FileNotFoundError:
            # pdflatex not found - try alternative methods or raise error
            raise RuntimeError("pdflatex command not found. LaTeX is required to compile PDFs.")
    
        # Clean up auxiliary files in temp directory
        for aux_ext in [".aux", ".log", ".out", ".toc", ".lof", ".lot", ".bbl", ".blg", ".idx", ".ind"]:
            for aux_file in temp_path.glob(f"*{aux_ext}"):
                try:
                    aux_file.unlink()
                except OSError:
                    pass  # Ignore errors during cleanup
        
        return str(pdf_path)