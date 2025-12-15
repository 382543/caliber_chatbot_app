# inspect_model.py — run this from the project root (folder that contains backend/)
import os, sys

p = os.path.join("backend", "food_classification_model.keras")

print("Checking model path:", p)
print("Exists:", os.path.exists(p))
print("Is directory:", os.path.isdir(p))
print("Is file:", os.path.isfile(p))

if os.path.isdir(p):
    print("Directory listing (top 50):")
    print(os.listdir(p)[:50])
elif os.path.isfile(p):
    print("File size (bytes):", os.path.getsize(p))
    # if it's an h5, try listing keys
    try:
        import h5py
        with h5py.File(p, "r") as f:
            print("HDF5 keys at root:", list(f.keys())[:50])
    except Exception as e:
        print("Not an HDF5 file or cannot open with h5py:", e)
