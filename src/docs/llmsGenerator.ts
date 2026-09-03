import { OpenAPI } from 'openapi-types';

export function generateLlmsFullText(spec: any): string {
  let md = '';

  // 1. Header
  const title = spec.info?.title || 'API Reference';
  const version = spec.info?.version || '1.0.0';
  const description = spec.info?.description || '';
  
  md += `# ${title} (v${version})\n\n`;
  if (description) {
    md += `${description}\n\n`;
  }

  // 2. Servers
  if (spec.servers && spec.servers.length > 0) {
    md += `## Servers\n\n`;
    spec.servers.forEach((s: any) => {
      md += `- **${s.url}**${s.description ? ` - ${s.description}` : ''}\n`;
    });
    md += '\n';
  }

  // 3. Authentication
  if (spec.components?.securitySchemes) {
    md += `## Authentication\n\n`;
    for (const [name, scheme] of Object.entries(spec.components.securitySchemes)) {
      md += `### ${name}\n`;
      const s = scheme as any;
      if (s.type) md += `- **Type**: ${s.type}\n`;
      if (s.scheme) md += `- **Scheme**: ${s.scheme}\n`;
      if (s.bearerFormat) md += `- **Format**: ${s.bearerFormat}\n`;
      if (s.description) md += `${s.description}\n`;
      md += '\n';
    }
  }

  // 4. Endpoints
  md += `## Endpoints\n\n`;

  const paths = spec.paths || {};
  for (const [path, methods] of Object.entries(paths)) {
    for (const [method, operation] of Object.entries(methods as any)) {
      if (method === 'parameters') continue;
      
      const op = operation as any;
      md += `### ${method.toUpperCase()} ${path}\n\n`;
      
      if (op.summary) md += `**Summary**: ${op.summary}\n\n`;
      if (op.description) md += `${op.description}\n\n`;
      
      if (op.tags && op.tags.length > 0) {
        md += `**Tags**: ${op.tags.join(', ')}\n\n`;
      }

      // Parameters
      if (op.parameters && op.parameters.length > 0) {
        md += `#### Parameters\n\n`;
        md += `| Name | In | Type | Required | Description |\n`;
        md += `| --- | --- | --- | --- | --- |\n`;
        op.parameters.forEach((p: any) => {
          const pName = p.name || '';
          const pIn = p.in || '';
          const pType = p.schema?.type || '';
          const pReq = p.required ? 'Yes' : 'No';
          const pDesc = (p.description || '').replace(/\n/g, ' ');
          md += `| ${pName} | ${pIn} | ${pType} | ${pReq} | ${pDesc} |\n`;
        });
        md += '\n';
      }

      // Request Body
      if (op.requestBody?.content) {
        md += `#### Request Body\n\n`;
        for (const [contentType, content] of Object.entries(op.requestBody.content)) {
          md += `**Content-Type**: \`${contentType}\`\n\n`;
          const c = content as any;
          if (c.schema) {
            md += "```json\n";
            md += JSON.stringify(c.schema, null, 2);
            md += "\n```\n\n";
          }
        }
      }

      // Responses
      if (op.responses) {
        md += `#### Responses\n\n`;
        for (const [status, response] of Object.entries(op.responses)) {
          const r = response as any;
          md += `- **${status}**: ${r.description || ''}\n`;
        }
        md += '\n';
      }
      
      md += `---\n\n`;
    }
  }

  // 5. Schemas
  if (spec.components?.schemas) {
    md += `## Data Models (Schemas)\n\n`;
    for (const [name, schema] of Object.entries(spec.components.schemas)) {
      md += `### ${name}\n\n`;
      md += "```json\n";
      md += JSON.stringify(schema, null, 2);
      md += "\n```\n\n";
    }
  }

  return md;
}
