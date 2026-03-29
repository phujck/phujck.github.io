import sys
from PIL import Image

def make_transparent(input_path):
    img = Image.open(input_path).convert('RGBA')
    W, H = img.size
    data = img.getdata()
    new_data = []
    
    for item in data:
        r, g, b, a = item
        L = 0.299 * r + 0.587 * g + 0.114 * b
        # Any near-black pixel gets 0 alpha
        # Bright lines get full/partial alpha
        alpha = int(L * 1.5)  # boost opacity of lines
        
        # We can also softly fade the left/bottom edges strictly if there's a harsh crop line.
        # But Luminance to Alpha natively hides the dark background box perfectly.
        alpha = max(0, min(255, alpha))
        
        # Ensure pure colors, but driven by alpha
        new_data.append((r, g, b, alpha))
        
    img.putdata(new_data)
    img.save(input_path, 'PNG')
    print("Background stripped to pure transparency.")

if __name__ == "__main__":
    make_transparent('assets/img/me_sketch_cleaned.png')
