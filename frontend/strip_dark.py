import os
import re

directories = [
    r'd:\Projects3\Zimbabwe Import Duty And Customs Calculator\frontend\src\pages\admin',
    r'd:\Projects3\Zimbabwe Import Duty And Customs Calculator\frontend\src\components\layout'
]

pattern = re.compile(r'\bdark:[a-zA-Z0-9/-]+\b\s*')

for directory in directories:
    for filename in os.listdir(directory):
        if filename.endswith('.tsx') and filename.startswith('Admin'):
            filepath = os.path.join(directory, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = pattern.sub('', content)
            
            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Updated {filename}")
print("Done")
