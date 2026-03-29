from PIL import Image, ImageOps

def extract_lines(input_path, output_path):
    # Open image, convert to grayscale
    img = Image.open(input_path).convert('L')
    
    # The paper is light, the pencil is dark.
    # After inverting, pencil is light, paper is dark.
    img = ImageOps.invert(img)
    
    # Enhance contrast massively to drop the paper (now dark) to pure black
    from PIL import ImageEnhance
    img = ImageEnhance.Contrast(img).enhance(3.0)
    img = ImageEnhance.Brightness(img).enhance(1.2)
    
    # Now convert to RGBA
    img = img.convert("RGBA")
    datas = img.getdata()
    
    new_data = []
    # Gold color: R=218, G=165, B=32
    # The 'lightness' (pixel value) will become the alpha!
    for item in datas:
        # item is (L, L, L, 255) because it was converted from L to RGBA
        brightness = item[0]
        # Ignore weak lines (background noise)
        if brightness < 40:
            new_data.append((255, 255, 255, 0)) # Perfect transparency
        else:
            # Map brightness directly to alpha, keep color gold
            # We add a bit of non-linear alpha so lines are sharp
            alpha = min(255, int((brightness - 40) * 1.5))
            new_data.append((218, 165, 32, alpha))
            
    img.putdata(new_data)
    img.save(output_path, "PNG")

extract_lines("assets/img/me_sketch.jpg", "assets/img/me_sketch_extracted.png")
print("Extraction complete!")
