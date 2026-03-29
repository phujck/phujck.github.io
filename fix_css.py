def fix_css():
    with open('assets/css/style.css', 'rb') as f:
        data = f.read()
    
    # decode ignoring bad bytes
    text = data.decode('utf-8', errors='ignore')
    
    # remove anything from "/* Sketch Profile Modifiers" onward
    if "/* Sketch Profile" in text:
        text = text[:text.index("/* Sketch Profile")]
        
    # Append the new clean css
    new_css = """
/* Sketch Profile Modifiers */
.hero-sketch {
    border: none !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    background: transparent !important;
    filter: none !important;
    mix-blend-mode: normal !important;
}
"""
    with open('assets/css/style.css', 'w', encoding='utf-8') as f:
        f.write(text.strip() + "\n" + new_css)
        print("CSS fixed")

if __name__ == "__main__":
    fix_css()
