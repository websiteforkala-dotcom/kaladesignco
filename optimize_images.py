import os
from PIL import Image

def optimize_images(directory, max_width=1920, quality=85):
    print(f"Optimizing images in {directory}...")
    
    # Supported extensions
    extensions = {'.jpg', '.jpeg', '.png', '.webp'}
    
    total_saved = 0
    count = 0
    
    for root, dirs, files in os.walk(directory):
        for file in files:
            ext = os.path.splitext(file)[1].lower()
            if ext not in extensions:
                continue
                
            file_path = os.path.join(root, file)
            original_size = os.path.getsize(file_path)
            
            try:
                with Image.open(file_path) as img:
                    # Convert RGBA to RGB if needed (for JPEG saving)
                    if img.mode in ('RGBA', 'P') and ext in ['.jpg', '.jpeg']:
                        img = img.convert('RGB')
                        
                    # Resize if too large
                    width, height = img.size
                    if width > max_width:
                        ratio = max_width / width
                        new_height = int(height * ratio)
                        img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
                        print(f"Resized {file}: {width}x{height} -> {max_width}x{new_height}")
                    
                    # Save optimized
                    # For PNGs that don't need transparency, converting to JPG saves space
                    # But let's keep extensions same unless we want to force JPG
                    
                    # Force save as optimizations
                    if ext in ['.jpg', '.jpeg']:
                        img.save(file_path, 'JPEG', quality=quality, optimize=True)
                    elif ext == '.png':
                        # Check if it has transparency
                        if img.mode == 'RGBA':
                             # Keep as PNG but optimize
                             img.save(file_path, 'PNG', optimize=True)
                        else:
                             # Convert to JPG for better compression if no transparency
                             rgb_im = img.convert('RGB')
                             new_path = os.path.splitext(file_path)[0] + '.jpg'
                             rgb_im.save(new_path, 'JPEG', quality=quality, optimize=True)
                             # Remove old png if desired, or keep both. 
                             # For this task, let's keep both or replace? 
                             # Replacing is risky if code references PNG. 
                             # LET'S just optimize the PNG content without changing extension/format if possible, 
                             # OR just compress the PNG.
                             img.save(file_path, 'PNG', optimize=True)

                    elif ext == '.webp':
                         img.save(file_path, 'WEBP', quality=quality)
                    
                    new_size = os.path.getsize(file_path)
                    saved = original_size - new_size
                    total_saved += saved
                    count += 1
                    
                    if saved > 0:
                        print(f"Optimized {file}: {original_size/1024:.1f}KB -> {new_size/1024:.1f}KB (Saved {saved/1024:.1f}KB)")
                    
            except Exception as e:
                print(f"Error optimizing {file}: {e}")

    print(f"\nTotal images optimized: {count}")
    print(f"Total space saved: {total_saved / (1024*1024):.2f} MB")

if __name__ == "__main__":
    base_dir = "."
    assets_dir = os.path.join(base_dir, "assets")
    
    # Optimize Projects folder (Photos - mostly JPGs)
    projects_dir = os.path.join(assets_dir, "projects")
    if os.path.exists(projects_dir):
        optimize_images(projects_dir, max_width=1600, quality=80)
        
    # Optimize Clients folder (Logos - keep usually small but check)
    clients_dir = os.path.join(assets_dir, "clients")
    if os.path.exists(clients_dir):
        optimize_images(clients_dir, max_width=800, quality=85)
