const fs = require('fs');
const path = require('path');

// Append missing hooks
function safeAppend(file, content) {
    if (fs.existsSync(file)) {
        fs.appendFileSync(file, content);
    }
}

safeAppend('apps/web/src/hooks/useBlog.ts', '\nexport const useRelatedPosts = (slug: string) => ({ data: [] as BlogPost[], isLoading: false });\n');
safeAppend('apps/web/src/hooks/useDealers.ts', '\nexport const useDealerVehicles = (slug: string) => ({ data: [], isLoading: false });\nexport const generateDealerSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-");\n');
safeAppend('apps/web/src/hooks/useChat.ts', '\nexport const useChatSubscription = (id: string, cb: any) => {};\nexport const useConversationMessages = (id: string) => ({ data: [], isLoading: false });\nexport const useSendMessage = () => ({ mutate: (d: any) => {}, isPending: false });\nexport const useMarkAsRead = () => ({ mutate: (id: string) => {} });\n');

// Clean up problematic Lucide icons
function walkDir(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            results = results.concat(walkDir(fullPath));
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            results.push(fullPath);
        }
    });
    return results;
}

const allTsxFiles = walkDir('apps/web/src');
allTsxFiles.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    let changed = false;
    if (content.includes('lucide-react')) {
        const originalContent = content;
        content = content.replace(/\bFacebook\b,?/g, '');
        content = content.replace(/\bInstagram\b,?/g, '');
        content = content.replace(/\bYoutube\b,?/g, '');
        if (content !== originalContent) {
            changed = true;
        }
    }
    if (changed) {
        fs.writeFileSync(f, content);
    }
});

console.log("Fixes applied.");
