from PIL import Image

def crop_sketch():
    with Image.open("assets/img/writing_sketch.jpg") as img:
        # 768 x 1024
        # Crop borders: left, top, right, bottom
        left = int(768 * 0.12)
        top = int(1024 * 0.18)
        right = int(768 * 0.95)
        bottom = int(1024 * 0.95)
        
        cropped = img.crop((left, top, right, bottom))
        cropped.save("assets/img/me_sketch.jpg")
        print("Cropped sketch to me_sketch.jpg")

def crop_writing_hero():
    with Image.open("assets/img/writing_hero.jpg") as img:
        # 1024 x 771
        # Remove headphones on the left (20%), remove top above table cloth (35%)
        # Right and bottom remain the same.
        left = int(1024 * 0.22)
        top = int(771 * 0.38)
        right = 1024
        bottom = 771
        
        cropped = img.crop((left, top, right, bottom))
        cropped.save("assets/img/writing_hero.jpg")
        print("Cropped writing_hero.jpg")

if __name__ == "__main__":
    crop_sketch()
    crop_writing_hero()
