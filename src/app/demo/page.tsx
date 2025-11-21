/**
 * Demo Page - Shows how to embed the widget
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Script from 'next/script';

export default function DemoPage() {
  return (
    <>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Polaris AI Support Demo</h1>
            <p className="text-gray-600 mt-2">
              See the chat widget in action (bottom right corner)
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Welcome to Polaris AI Support</CardTitle>
              <CardDescription>
                This is a demo page showing the embeddable chat widget
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Features</h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Badge>✓</Badge>
                    <span>Instant answers from your knowledge base</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Badge>✓</Badge>
                    <span>Multi-language support (English & Chinese)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Badge>✓</Badge>
                    <span>Real-time responses powered by AI</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Badge>✓</Badge>
                    <span>Easy to embed on any website</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  How to Embed
                </h3>
                <p className="text-gray-600 mb-3">
                  Add this single line of code to your website:
                </p>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                  {`<script src="https://your-domain.com/embed.js"></script>`}
                </pre>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Try the Widget
                </h3>
                <p className="text-gray-600">
                  Click the chat button in the bottom right corner to start a
                  conversation. Try asking questions about Polaris AI Support!
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Example Questions</CardTitle>
              <CardDescription>Try asking the widget these questions</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="p-3 bg-gray-50 rounded-lg text-sm">
                  "What are the key features of Polaris AI Support?"
                </li>
                <li className="p-3 bg-gray-50 rounded-lg text-sm">
                  "How much does the Pro tier cost?"
                </li>
                <li className="p-3 bg-gray-50 rounded-lg text-sm">
                  "What file formats are supported?"
                </li>
                <li className="p-3 bg-gray-50 rounded-lg text-sm">
                  "这个产品支持哪些语言？" (What languages does this product support?)
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Embed the widget */}
      <Script src="/embed.js" strategy="afterInteractive" />
    </>
  );
}
