import os

replacements = {
    'ðŸœ': '',
    'ðŸš': '',
    'ðŸ': '',
    'âšï ': '',
    'ðŸ': '',
    'ðŸï ': '',
    'ðŸŸ': '',
    'ðŸ': '',
    'ðŸŠ': '',
    'ðŸ': '',
    'ðŸ': '',
    'âœ': '',
    'âš': '',
    'ðŸŽ': '',
    'ðŸ': '',
    'ðŸ ': '',
    'ðŸ': '',
    'â': '',
    'â': '',
    'â': '',
    'â': '',
    'ââ': ''
}

def process_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = content
    for k, v in replacements.items():
        new_content = new_content.replace(k, v)

    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'Fixed {file_path}')

src_dir = 'src'
for root, dirs, files in os.walk(src_dir):
    for name in files:
        if name.endswith('.tsx') or name.endswith('.ts'):
            process_file(os.path.join(root, name))

print('Done')
