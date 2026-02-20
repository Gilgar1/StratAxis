"""
Remove all emojis from markdown files
"""
import re
from pathlib import Path

def remove_emojis(text):
    """Remove emoji characters from text"""
    # Emoji pattern - covers most common emojis
    emoji_pattern = re.compile(
        "["
        "\U0001F1E0-\U0001F1FF"  # flags (iOS)
        "\U0001F300-\U0001F5FF"  # symbols & pictographs
        "\U0001F600-\U0001F64F"  # emoticons
        "\U0001F680-\U0001F6FF"  # transport & map symbols
        "\U0001F700-\U0001F77F"  # alchemical symbols
        "\U0001F780-\U0001F7FF"  # Geometric Shapes Extended
        "\U0001F800-\U0001F8FF"  # Supplemental Arrows-C
        "\U0001F900-\U0001F9FF"  # Supplemental Symbols and Pictographs
        "\U0001FA00-\U0001FA6F"  # Chess Symbols
        "\U0001FA70-\U0001FAFF"  # Symbols and Pictographs Extended-A
        "\U00002702-\U000027B0"  # Dingbats
        "\U000024C2-\U0001F251"
        "\U00002600-\U000026FF"  # Misc symbols
        "\U00002700-\U000027BF"  # Dingbats
        "\U0000FE00-\U0000FE0F"  # Variation Selectors
        "\U0001F900-\U0001F9FF"  # Supplemental Symbols and Pictographs
        "\U0001FA70-\U0001FAFF"
        "\U00002300-\U000023FF"  # Misc Technical
        "\u200d"                 # Zero width joiner
        "\u2640-\u2642"          # Gender symbols
        "]+",
        flags=re.UNICODE
    )
    return emoji_pattern.sub('', text)

# Process all markdown files
md_files = [
    'README.md',
    'QUICKSTART.md',
    'TECHNICAL_DOCS.md',
    'DELIVERY_SUMMARY.md',
    'EXECUTION_REPORT.md'
]

base_path = Path('c:/Users/ander/Desktop/strataxis data two')

for md_file in md_files:
    file_path = base_path / md_file
    if file_path.exists():
        print(f"Processing {md_file}...")
        
        # Read original
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Remove emojis
        cleaned = remove_emojis(content)
        
        # Write back
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(cleaned)
        
        print(f"  Cleaned {md_file}")
    else:
        print(f"  Skipping {md_file} (not found)")

print("\nAll markdown files cleaned!")
