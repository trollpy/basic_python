// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', async function() {
    // Initialize Pyodide
    console.log("Loading Pyodide...");
    let pyodide;
    try {
        pyodide = await loadPyodide();
        console.log("Pyodide loaded successfully!");
    } catch (error) {
        console.error("Failed to load Pyodide:", error);
        // Show error message in all output areas
        document.querySelectorAll('.code-output').forEach(outputArea => {
            outputArea.textContent = "Error: Failed to load Python interpreter. Please try refreshing the page.";
            outputArea.classList.add('error');
        });
        return;
    }

    // Configure Python stdout to capture print statements
    pyodide.runPython(`
        import sys
        from pyodide.ffi import create_proxy
        
        class PyodideOutput:
            def __init__(self):
                self.output = ""
            
            def write(self, text):
                self.output += text
            
            def flush(self):
                pass
            
            def clear(self):
                self.output = ""
                
        pyodide_output = PyodideOutput()
        sys.stdout = pyodide_output
        sys.stderr = pyodide_output
    `);

    // Get all run buttons and add event listeners
    const runButtons = document.querySelectorAll('.run-btn');
    runButtons.forEach(button => {
        button.addEventListener('click', function() {
            const codeEditor = this.closest('.code-editor');
            const codeInput = codeEditor.querySelector('.code-input');
            const codeOutput = codeEditor.querySelector('.code-output');
            
            // Clear previous output
            pyodide.runPython('pyodide_output.clear()');
            codeOutput.textContent = '';
            codeOutput.classList.remove('error');
            
            // Run the Python code
            try {
                // Execute the code
                pyodide.runPython(codeInput.value);
                
                // Get the captured output
                const output = pyodide.runPython('pyodide_output.output');
                codeOutput.textContent = output;
            } catch (error) {
                // Display error message
                codeOutput.textContent = `Error: ${error.message}`;
                codeOutput.classList.add('error');
                console.error("Python execution error:", error);
            }
        });
    });

    // Handle navigation links
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Smooth scroll to section
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                e.preventDefault();
                window.scrollTo({
                    top: targetSection.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add active class to nav link based on scroll position
    window.addEventListener('scroll', function() {
        const scrollPosition = window.scrollY;
        
        document.querySelectorAll('section').forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });

    // Handle custom input function simulation
    window.inputValues = {
        index: 0,
        values: []
    };

    // Override Python's input function to work with our simulated input
    pyodide.runPython(`
        import builtins
        
        _original_input = builtins.input
        
        def custom_input(prompt=""):
            print(prompt, end="")
            # In a real app, we would get actual user input
            # Here we'll return predefined values for the calculator example
            if "first" in prompt.lower():
                return "10"
            elif "operator" in prompt.lower():
                return "+"
            elif "second" in prompt.lower():
                return "5"
            return ""
            
        builtins.input = custom_input
    `);

    // Highlight code areas for better readability
    document.querySelectorAll('.code-input').forEach(element => {
        element.addEventListener('input', function() {
            // You could add code highlighting here if needed
        });
    });

    // Initialize with "Basics" as active section
    document.querySelector('.nav-links a[href="#basics"]').classList.add('active');
});