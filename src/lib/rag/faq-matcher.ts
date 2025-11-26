/**
 * FAQ Matcher - Keyword-based matching for common questions
 * Provides instant responses for frequent queries without RAG overhead
 */

export interface FAQMatch {
  answer: string;
  answerZh: string;
  confidence: number;
  category: string;
}

interface FAQEntry {
  keywords: string[];
  answer: string;
  answerZh: string;
  category: string;
}

const CALENDLY_LINK = 'https://calendly.com/polarisaistudio/introduction-call';

const faqDatabase: FAQEntry[] = [
  {
    keywords: ['pricing', 'cost', 'price', 'how much', 'fee', 'charge', '价格', '费用', '多少钱'],
    answer: `Our AI solutions start at $800/month for small businesses. This includes setup, training, unlimited conversations, and ongoing support. Book a free consultation to get a personalized quote: ${CALENDLY_LINK}`,
    answerZh: `我们的AI解决方案起步价为每月800美元，适合小型企业。包括设置、培训、无限对话和持续支持。预约免费咨询获取个性化报价：${CALENDLY_LINK}`,
    category: 'pricing',
  },
  {
    keywords: ['chatbot', 'chat bot', 'ai assistant', 'ai chat', '聊天机器人', '智能客服'],
    answer: `Our AI chatbots handle 80% of customer inquiries 24/7, reduce support costs by 70%, and respond in under 1 second. Perfect for salons, clinics, real estate, restaurants, and more! Want to see it in action? Book a demo: ${CALENDLY_LINK}`,
    answerZh: `我们的AI聊天机器人全天候处理80%的客户咨询，降低70%的支持成本，响应时间不到1秒。非常适合沙龙、诊所、房地产、餐厅等行业！想看看效果吗？预约演示：${CALENDLY_LINK}`,
    category: 'chatbot',
  },
  {
    keywords: ['email', 'sms', 'marketing', 'lead capture', 'newsletter', '邮件', '短信', '营销'],
    answer: `We offer automated lead capture with instant email and SMS follow-up. Build your list, segment audiences, and nurture leads on autopilot. 5x higher engagement than email alone! Learn more in a free consultation: ${CALENDLY_LINK}`,
    answerZh: `我们提供自动化潜在客户获取功能，包括即时邮件和短信跟进。自动建立列表、细分受众、培育潜在客户。互动率比单独邮件高5倍！预约免费咨询了解更多：${CALENDLY_LINK}`,
    category: 'marketing',
  },
  {
    keywords: ['appointment', 'booking', 'schedule', 'demo', 'consultation', 'call', 'meet', '预约', '演示', '咨询', '会议'],
    answer: `I'd love to schedule a free 30-minute consultation for you! We'll show you exactly how AI can help your business. No commitment required. Book here: ${CALENDLY_LINK}`,
    answerZh: `很高兴为您安排免费30分钟咨询！我们将向您展示AI如何帮助您的业务。无需承诺。在这里预约：${CALENDLY_LINK}`,
    category: 'booking',
  },
  {
    keywords: ['how', 'work', 'process', 'setup', 'start', 'begin', 'get started', '怎么', '流程', '开始', '如何'],
    answer: `Getting started is simple: 1) Free consultation (30 min), 2) We design your custom solution, 3) We build & test (1-2 weeks), 4) Go live! We handle everything. Ready to start? ${CALENDLY_LINK}`,
    answerZh: `开始很简单：1) 免费咨询（30分钟），2) 我们设计定制方案，3) 我们构建和测试（1-2周），4) 上线！我们处理一切。准备开始了吗？${CALENDLY_LINK}`,
    category: 'process',
  },
  {
    keywords: ['industry', 'business', 'salon', 'clinic', 'real estate', 'restaurant', 'ecommerce', 'shop', '行业', '沙龙', '诊所', '房地产', '餐厅', '电商'],
    answer: `We work with salons, medical clinics, real estate agents, restaurants, e-commerce stores, and professional services. Each solution is customized for your industry! Tell us about your business: ${CALENDLY_LINK}`,
    answerZh: `我们服务于沙龙、医疗诊所、房地产经纪人、餐厅、电商店铺和专业服务。每个方案都针对您的行业定制！告诉我们您的业务：${CALENDLY_LINK}`,
    category: 'industries',
  },
  {
    keywords: ['contact', 'support', 'email address', 'phone', 'reach', '联系', '支持', '电话'],
    answer: `You can reach us at info@polarisaistudio.com or book a call directly: ${CALENDLY_LINK}`,
    answerZh: `您可以通过 info@polarisaistudio.com 联系我们，或直接预约通话：${CALENDLY_LINK}`,
    category: 'contact',
  },
  {
    keywords: ['case study', 'example', 'success', 'result', 'testimonial', 'client', '案例', '成功', '客户'],
    answer: `We've helped salons increase bookings by 40%, clinics reduce no-shows by 60%, and e-commerce stores boost conversions by 25%. Want to hear specific examples for your industry? Book a call: ${CALENDLY_LINK}`,
    answerZh: `我们帮助沙龙预约量增加40%，诊所爽约率降低60%，电商转化率提升25%。想了解您行业的具体案例吗？预约通话：${CALENDLY_LINK}`,
    category: 'case-studies',
  },
];

/**
 * Match user question against FAQ database
 */
export function matchFAQ(question: string): FAQMatch | null {
  const normalizedQuestion = question.toLowerCase().trim();

  let bestMatch: { entry: FAQEntry; matchCount: number } | null = null;

  for (const entry of faqDatabase) {
    let matchCount = 0;

    for (const keyword of entry.keywords) {
      if (normalizedQuestion.includes(keyword.toLowerCase())) {
        matchCount++;
      }
    }

    if (matchCount > 0 && (!bestMatch || matchCount > bestMatch.matchCount)) {
      bestMatch = { entry, matchCount };
    }
  }

  if (!bestMatch) {
    return null;
  }

  // Calculate confidence based on match count and keyword coverage
  const confidence = Math.min(bestMatch.matchCount / 2, 1); // Cap at 1.0

  // Only return if confidence is reasonable (at least one strong match)
  if (confidence < 0.5) {
    return null;
  }

  return {
    answer: bestMatch.entry.answer,
    answerZh: bestMatch.entry.answerZh,
    confidence,
    category: bestMatch.entry.category,
  };
}

/**
 * Get default response when no FAQ or RAG match
 */
export function getDefaultResponse(language: 'en' | 'zh' = 'en'): string {
  if (language === 'zh') {
    return `感谢您的提问！如果您想进一步了解我们的AI解决方案，欢迎预约免费咨询：${CALENDLY_LINK}`;
  }
  return `Thanks for your question! If you'd like to learn more about our AI solutions, feel free to book a free consultation: ${CALENDLY_LINK}`;
}
