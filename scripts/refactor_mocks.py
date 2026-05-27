import os
import re

os.makedirs("lib/mock", exist_ok=True)

def process_file(src, dst, type_name, array_name, factory_name):
    if not os.path.exists(src):
        print(f"Not found: {src}")
        return
    with open(src, "r") as f:
        content = f.read()
    
    # Change export const ArrayName to const ArrayName
    # Wait, some files might have multiple exports.
    content = content.replace(f"export const {array_name}", f"export const {array_name}")
    
    # Add factory
    factory = f"""

export const {factory_name} = (overrides?: Partial<{type_name}>): {type_name} => ({{
  ...{array_name}[0],
  ...overrides,
}});
"""
    content += factory
    
    with open(dst, "w") as f:
        f.write(content)
    print(f"Processed {src} -> {dst}")

process_file("lib/mock-bounty.ts", "lib/mock/bounties.ts", "Bounty", "mockBounties", "makeMockBounty")
process_file("lib/mock-project.ts", "lib/mock/projects.ts", "Project", "mockProjects", "makeMockProject")
process_file("lib/mock-leaderboard.ts", "lib/mock/leaderboard.ts", "any", "mockLeaderboard", "makeMockLeaderboardEntry") # need to check types
process_file("lib/mock-wallet.ts", "lib/mock/wallet.ts", "any", "mockWalletWithAssets", "makeMockWallet")
process_file("lib/mock-model4.ts", "lib/mock/model4.ts", "any", "mockModel4", "makeMockModel4")

# Delete old files later
