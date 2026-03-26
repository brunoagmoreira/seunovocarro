const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir(directoryPath, function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // React Router DOM imports replace
    if (content.includes('react-router-dom')) {
      // Replace imports selectively
      const navigationImports = [];
      if (content.match(/useNavigate/)) navigationImports.push('useRouter');
      if (content.match(/useLocation/)) navigationImports.push('usePathname');
      
      let nextNavigationImport = '';
      if (navigationImports.length > 0) {
        nextNavigationImport = `import { ${navigationImports.join(', ')} } from 'next/navigation';\n`;
      }

      let nextLinkImport = '';
      if (content.match(/import.*Link.*from 'react-router-dom'/)) {
        nextLinkImport = `import Link from 'next/link';\n`;
      }

      // Remove react-router-dom import entirely (assuming we only used Link, useNavigate, useLocation, Outlet)
      // Be careful if Outlet is used
      content = content.replace(/import\s+{([^}]*)}\s+from\s+['"]react-router-dom['"];?\n?/, (match, p1) => {
        let replacement = nextNavigationImport + nextLinkImport;
        return replacement;
      });

      // Replace Link to= with Link href=
      content = content.replace(/<Link([^>]*)to=/g, '<Link$1href=');
      
      // Replace useNavigate
      content = content.replace(/useNavigate\(\)/g, 'useRouter()');
      
      // Replace navigate( with router.push(
      // Warning: this assumes const navigate = useNavigate() was changed to const router = useRouter()
      content = content.replace(/const navigate = useRouter\(\);/g, 'const router = useRouter();');
      content = content.replace(/navigate\(/g, 'router.push(');

      // Replace useLocation
      content = content.replace(/useLocation\(\)/g, 'usePathname()');
      content = content.replace(/const location = usePathname\(\);/g, 'const pathname = usePathname();');
      content = content.replace(/location\.pathname/g, 'pathname');

      if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
      }
    }
  }
});
