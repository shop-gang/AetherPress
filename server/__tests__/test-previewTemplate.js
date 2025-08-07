// Script to test previewTemplate with various contentObj values
const fs = require("fs");

// Copy of the previewTemplate function from your server code
function previewTemplate(content) {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    .preview { max-width: 800px; margin: 2rem auto; font-family: system-ui; }
    .preview h1 { color: #2c3e50; }
    .preview .content { line-height: 1.6; }
  </style>
</head>
<body>
  <div class="preview">
    <h1>${content.title}</h1>
    <div class="content">${content.body}</div>
  </div>
</body>
</html>
`;
}

// Test cases
const testCases = [
  { title: "Simple Title", body: "Simple body." },
  { title: "Special <Title>", body: "Body with <b>HTML</b> & special chars." },
  { title: "", body: "" },
  { title: "Long Title ".repeat(10), body: "Long body ".repeat(100) },
  { title: "Injection", body: "<script>alert(1)</script>" },
];

testCases.forEach((content, i) => {
  const html = previewTemplate(content);
  fs.writeFileSync(`./samples/previewTemplate_test_${i + 1}.html`, html);
  console.log(`Generated previewTemplate_test_${i + 1}.html`);
});

console.log("Done. Open the generated HTML files to inspect the output.");
