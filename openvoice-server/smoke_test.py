import os, torch, shutil, tempfile
os.chdir(os.path.dirname(os.path.abspath(__file__)))

from openvoice.api import ToneColorConverter

CKPT_DIR = os.path.join("checkpoints_v2", "converter")
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Device: {device}")

tcc = ToneColorConverter(os.path.join(CKPT_DIR, "config.json"), device=device)
tcc.load_ckpt(os.path.join(CKPT_DIR, "checkpoint.pth"))
print("ToneColorConverter loaded OK")

ref_wav = os.path.join("..", "chatterbox-server", "celo_reference.wav")
with tempfile.TemporaryDirectory() as tmpdir:
    ref_copy = os.path.join(tmpdir, "ref.wav")
    shutil.copy2(ref_wav, ref_copy)
    se_save = os.path.join(tmpdir, "se.pth")
    se = tcc.extract_se([ref_copy], se_save_path=se_save)

print(f"Speaker embedding shape: {se.shape}")
print("All checks passed - server is ready to start.")
