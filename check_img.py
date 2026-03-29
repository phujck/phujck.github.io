from PIL import Image

def analyze(path):
    with Image.open(path) as img:
        print(f"Path: {path}")
        print(f"Size: {img.size}")
        print(f"Format: {img.format}")
        print("---")

analyze("assets/img/writing_sketch.jpg")
analyze("assets/img/writing_hero.jpg")
