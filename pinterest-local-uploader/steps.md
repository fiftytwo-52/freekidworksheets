
# Pinterest Sandbox Upload Commands

Make sure you run these from inside the `pinterest-local-uploader` directory.

### 1. Authenticate (Login)

Run this first to connect your app to the Pinterest Sandbox. It will open your browser so you can click "Allow".

```bash
python3 auth_local.py --sandbox
```

### 2. Post a single worksheet

This command uploads a single worksheet to the Sandbox.

```bash
python3 pin_local.py worksheet --code 50002
```

### 3. Post a batch of worksheets with Success/Fail messages

Copy and paste this entire block into your terminal. It will loop through your worksheets and explicitly tell you if each one succeeded or failed.

```bash
for c in 50002 50003 50004 50005 50006 50007 50008 50009 50010 50011; do
  echo "Uploading worksheet $c..."
  if python3 pin_local.py worksheet --code $c >/dev/null 2>&1; then
    echo "✅ Image $c published successfully!"
  else
    echo "❌ Image $c failed to publish."
  fi
  sleep 2
done
```

### 4. Check Account Status and Pin Count

```bash
python3 pin_local.py status
```
