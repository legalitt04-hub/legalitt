import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { COLORS } from '../../constants/theme';

// Highlighted Legal Terms List for auto-bolding
const IMPORTANT_LEGAL_TERMS = [
  'Public Documents',
  'Private Documents',
  'Indian Evidence Act',
  'Registration Act',
  'Supreme Court',
  'District Court',
  'High Court',
  'Consumer Court',
  'Legal Notice',
  'FIR',
  'Property Verification',
  'Document Authentication',
  'Bail Provisions',
  'BNSS',
  'CrPC',
  'IPC Section 420',
  'Transfer of Property Act',
  'Bharatiya Nyaya Sanhita',
  'Bharatiya Nagarik Suraksha Sanhita',
  'Security Deposit',
  'Power of Attorney',
  'Sale Deed',
  'Encumbrance Certificate',
];

// Regex to identify Legal References for chip rendering
const LEGAL_REF_REGEX = /\b(Section\s+\d+[A-Z]?|Article\s+\d+[A-Z]?|IPC\s+Section\s+\d+|Indian\s+Evidence\s+Act|Registration\s+Act|BNSS\s+Section\s+\d+|CrPC\s+Section\s+\d+|Act,\s+\d{4})\b/gi;

// Default follow-up questions generator based on query context
const getFollowUpQuestions = (text) => {
  const lower = text.toLowerCase();
  if (lower.includes('property') || lower.includes('deed') || lower.includes('land')) {
    return [
      'How do I verify property ownership?',
      'What documents are required for property transfer?',
      'Which government office maintains land records in India?'
    ];
  }
  if (lower.includes('fir') || lower.includes('police') || lower.includes('complaint') || lower.includes('crime')) {
    return [
      'What to do if police refuse to file an FIR?',
      'What is the difference between Zero FIR and Regular FIR?',
      'How can I get a copy of an FIR online?'
    ];
  }
  if (lower.includes('tenant') || lower.includes('rent') || lower.includes('landlord') || lower.includes('lease')) {
    return [
      'What are the legal rights of a tenant in India?',
      'How much notice period is required for eviction?',
      'How to claim security deposit refund legally?'
    ];
  }
  if (lower.includes('consumer') || lower.includes('refund') || lower.includes('defect')) {
    return [
      'How to file a case in Consumer Court?',
      'What is the time limit for consumer complaints?',
      'Can I file a consumer complaint online?'
    ];
  }
  return [
    'How do I verify the authenticity of this document?',
    'What are the next legal steps I should take?',
    'Which specific court has jurisdiction over this matter?'
  ];
};

// Select icon for headings based on keyword match
const getHeadingIcon = (titleText) => {
  const lower = titleText.toLowerCase();
  if (lower.includes('document') || lower.includes('paper') || lower.includes('file')) return '📄';
  if (lower.includes('advice') || lower.includes('law') || lower.includes('legal') || lower.includes('right')) return '⚖';
  if (lower.includes('property') || lower.includes('house') || lower.includes('land')) return '🏠';
  if (lower.includes('checklist') || lower.includes('step') || lower.includes('process')) return '📋';
  if (lower.includes('warning') || lower.includes('caution') || lower.includes('risk')) return '⚠';
  if (lower.includes('tip') || lower.includes('note') || lower.includes('important')) return '💡';
  if (lower.includes('reference') || lower.includes('act') || lower.includes('section') || lower.includes('article')) return '📚';
  if (lower.includes('require') || lower.includes('proof') || lower.includes('verifi')) return '📑';
  if (lower.includes('summary') || lower.includes('overview') || lower.includes('conclus')) return '✅';
  if (lower.includes('ask') || lower.includes('question') || lower.includes('follow')) return '❓';
  return '📌';
};

/**
 * Renders inline text with:
 * 1. Bold text from markdown (**term** or recognized important terms)
 * 2. Elegant chips for legal references (Section 17, Article 300A, etc.)
 */
const RenderFormattedInlineText = ({ text, baseStyle = {} }) => {
  if (!text) return null;

  // Split text into tokens based on markdown bold (**...**) and legal references
  // First, normalize raw markdown bold syntax into delimited tags: [BOLD]term[ENDBOLD]
  let cleaned = text.replace(/\*\*(.*?)\*\*/g, '[BOLD]$1[ENDBOLD]');

  // Also auto-tag important legal terms if not already tagged
  IMPORTANT_LEGAL_TERMS.forEach((term) => {
    const regex = new RegExp(`\\b(${term})\\b`, 'gi');
    cleaned = cleaned.replace(regex, (match) => {
      // Avoid double wrapping if already inside [BOLD]
      return `[BOLD]${match}[ENDBOLD]`;
    });
  });

  // Tag Legal References: [REF]Section 17[ENDREF]
  cleaned = cleaned.replace(LEGAL_REF_REGEX, (match) => `[REF]${match}[ENDREF]`);

  // Tokenize
  const parts = [];
  const tokenRegex = /(\[BOLD\].*?\[ENDBOLD\]|\[REF\].*?\[ENDREF\])/g;
  let lastIndex = 0;
  let match;

  while ((match = tokenRegex.exec(cleaned)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: cleaned.substring(lastIndex, match.index) });
    }
    const token = match[0];
    if (token.startsWith('[BOLD]')) {
      const inner = token.replace('[BOLD]', '').replace('[ENDBOLD]', '');
      parts.push({ type: 'bold', content: inner });
    } else if (token.startsWith('[REF]')) {
      const inner = token.replace('[REF]', '').replace('[ENDREF]', '');
      parts.push({ type: 'ref', content: inner });
    }
    lastIndex = tokenRegex.lastIndex;
  }
  if (lastIndex < cleaned.length) {
    parts.push({ type: 'text', content: cleaned.substring(lastIndex) });
  }

  return (
    <Text style={[styles.baseText, baseStyle]}>
      {parts.map((p, idx) => {
        if (p.type === 'bold') {
          return (
            <Text key={idx} style={styles.boldText}>
              {p.content}
            </Text>
          );
        }
        if (p.type === 'ref') {
          return (
            <Text key={idx} style={styles.legalRefChip}>
              {` ${p.content} `}
            </Text>
          );
        }
        // Clean out any remaining markdown noise
        const rawContent = p.content.replace(/[\*_`#]/g, '');
        return <Text key={idx}>{rawContent}</Text>;
      })}
    </Text>
  );
};

export const FormattedAIResponse = ({ content, onSelectFollowUp }) => {
  if (!content) return null;

  // 1. Separate disclaimer if present at bottom
  let mainBody = content;
  let disclaimerText = '';

  const disclaimerIndex = mainBody.search(/(⚠️|DISCLAIMER:)/i);
  if (disclaimerIndex !== -1 && disclaimerIndex > mainBody.length / 2) {
    disclaimerText = mainBody.substring(disclaimerIndex).trim();
    mainBody = mainBody.substring(0, disclaimerIndex).trim();
  }

  // Fix concatenated headings like "**Heading**Text" or "HeadingIn Indian law"
  mainBody = mainBody.replace(/(\*\*[^*]+\*\*)\s*([A-Za-z])/g, '$1\n$2');
  mainBody = mainBody.replace(/([a-z])(Types of|Process of|Applicable|Important|Conclusion|Summary|Section|Article)/g, '$1\n\n$2');

  // 2. Parse lines into blocks
  const rawLines = mainBody.split('\n');
  const blocks = [];
  let currentList = null;
  let currentCallout = null;
  let inCodeBlock = false;
  let codeBuffer = [];
  let inTable = false;
  let tableRows = [];
  let hasMainTitle = false;
  let extractedSummary = null;
  let explicitFollowUps = [];

  const flushList = () => {
    if (currentList) {
      blocks.push(currentList);
      currentList = null;
    }
  };

  const flushCallout = () => {
    if (currentCallout) {
      blocks.push(currentCallout);
      currentCallout = null;
    }
  };

  const flushTable = () => {
    if (inTable && tableRows.length > 0) {
      blocks.push({ type: 'table', rows: tableRows });
      tableRows = [];
      inTable = false;
    }
  };

  for (let i = 0; i < rawLines.length; i++) {
    const rawLine = rawLines[i];
    const line = rawLine.trim();

    // Check code blocks ```
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        blocks.push({ type: 'code', code: codeBuffer.join('\n') });
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        flushList();
        flushCallout();
        flushTable();
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(rawLine);
      continue;
    }

    // Check Tables | col1 | col2 |
    if (line.startsWith('|') && line.endsWith('|')) {
      flushList();
      flushCallout();
      // Ignore separator row like |---|---|
      if (line.includes('---')) continue;
      inTable = true;
      const cells = line.split('|').map(c => c.trim()).filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
      tableRows.push(cells);
      continue;
    } else if (inTable) {
      flushTable();
    }

    // Empty lines -> separator
    if (!line) {
      flushList();
      flushCallout();
      continue;
    }

    // Check Horizontal Rules / Dividers
    if (line === '---' || line === '***' || line === '___') {
      flushList();
      flushCallout();
      blocks.push({ type: 'divider' });
      continue;
    }

    // Check Callout Boxes (Note:, Warning:, Tip:, Important:, Disclaimer:)
    const calloutMatch = line.match(/^(Note|Warning|Important|Tip|Disclaimer|⚠️|💡|📌):\s*(.*)/i);
    if (calloutMatch) {
      flushList();
      flushCallout();
      const typeStr = calloutMatch[1].toLowerCase();
      let boxType = 'note';
      let title = 'Note';
      let icon = '📌';

      if (typeStr.includes('warn') || typeStr.includes('⚠️')) {
        boxType = 'warning';
        title = 'Warning';
        icon = '⚠️';
      } else if (typeStr.includes('important')) {
        boxType = 'important';
        title = 'Important';
        icon = '⚠️';
      } else if (typeStr.includes('tip') || typeStr.includes('💡')) {
        boxType = 'tip';
        title = 'Tip';
        icon = '💡';
      }

      currentCallout = {
        type: 'callout',
        boxType,
        title,
        icon,
        content: calloutMatch[2],
      };
      continue;
    }

    // Check Quotes > text
    if (line.startsWith('>')) {
      flushList();
      flushCallout();
      const quoteText = line.replace(/^>\s*/, '');
      blocks.push({ type: 'quote', text: quoteText });
      continue;
    }

    // Check Headings: # Heading, ## Heading, ### Heading, or standalone **Heading**
    const headerMatch = line.match(/^(#{1,4})\s+(.*)/);
    const boldHeaderMatch = !headerMatch && line.match(/^\*\*([^*]+)\*\*$/);

    if (headerMatch || boldHeaderMatch) {
      flushList();
      flushCallout();
      const titleText = (headerMatch ? headerMatch[2] : boldHeaderMatch[1]).trim();
      const icon = getHeadingIcon(titleText);

      // Check if it's "You may also ask" section
      if (titleText.toLowerCase().includes('you may also ask')) {
        // Collect follow-up questions from subsequent lines
        let j = i + 1;
        while (j < rawLines.length) {
          const fLine = rawLines[j].trim();
          if (fLine.startsWith('•') || fLine.startsWith('-') || fLine.startsWith('*') || fLine.match(/^\d+[\.\)]/)) {
            const qText = fLine.replace(/^[\•\-\*\d\.\)]\s*/, '').trim();
            if (qText) explicitFollowUps.push(qText);
          }
          j++;
        }
        i = rawLines.length; // skip rest
        continue;
      }

      if (!hasMainTitle) {
        hasMainTitle = true;
        blocks.push({ type: 'main_title', text: titleText, icon });
      } else {
        blocks.push({ type: 'heading', text: titleText, icon });
      }
      continue;
    }

    // Check Numbered Lists (1. Item, 2. Item)
    const numMatch = line.match(/^(\d+)[\.\)]\s+(.*)/);
    if (numMatch) {
      flushCallout();
      if (!currentList || currentList.listType !== 'numbered') {
        flushList();
        currentList = { type: 'list', listType: 'numbered', items: [] };
      }
      currentList.items.push({ num: numMatch[1], text: numMatch[2] });
      continue;
    }

    // Check Bullet Lists (• Item, - Item, * Item)
    const bulletMatch = line.match(/^[\•\-\*]\s+(.*)/);
    if (bulletMatch) {
      flushCallout();
      if (!currentList || currentList.listType !== 'bullet') {
        flushList();
        currentList = { type: 'list', listType: 'bullet', items: [] };
      }
      currentList.items.push({ text: bulletMatch[1] });
      continue;
    }

    // If we reach here, it's a regular paragraph line
    flushList();
    if (currentCallout) {
      currentCallout.content += ' ' + line;
    } else {
      blocks.push({ type: 'paragraph', text: line });
    }
  }

  flushList();
  flushCallout();
  flushTable();

  // 3. Auto-generate Summary section if long response (> 200 words) & no summary block present
  const totalWords = mainBody.split(/\s+/).length;
  const hasExplicitSummary = blocks.some(b => b.type === 'heading' && b.text.toLowerCase().includes('summary'));

  if (totalWords > 200 && !hasExplicitSummary) {
    // Extract key points from lists or headings for summary
    const summaryPoints = [];
    blocks.forEach(b => {
      if (b.type === 'list' && b.items.length > 0) {
        summaryPoints.push(b.items[0].text);
      } else if (b.type === 'heading') {
        summaryPoints.push(b.text);
      }
    });

    if (summaryPoints.length >= 2) {
      extractedSummary = summaryPoints.slice(0, 4);
    }
  }

  // 4. Follow-Up Questions ("You may also ask")
  const followUpQuestions = explicitFollowUps.length > 0 ? explicitFollowUps : getFollowUpQuestions(mainBody);

  return (
    <View style={styles.container}>
      {blocks.map((block, idx) => {
        switch (block.type) {
          case 'main_title':
            return (
              <View key={idx} style={styles.mainTitleRow}>
                <Text style={styles.mainTitleText}>
                  {`${block.icon} `}
                  <RenderFormattedInlineText text={block.text} baseStyle={styles.mainTitleText} />
                </Text>
              </View>
            );

          case 'heading':
            return (
              <View key={idx} style={styles.headingRow}>
                <Text style={styles.headingText}>
                  {`${block.icon} `}
                  <RenderFormattedInlineText text={block.text} baseStyle={styles.headingText} />
                </Text>
              </View>
            );

          case 'paragraph':
            return (
              <View key={idx} style={styles.paragraphBox}>
                <RenderFormattedInlineText text={block.text} baseStyle={styles.paragraphText} />
              </View>
            );

          case 'list':
            return (
              <View key={idx} style={styles.listBox}>
                {block.items.map((item, itemIdx) => (
                  <View key={itemIdx} style={styles.listItemRow}>
                    <Text style={styles.listBulletPrefix}>
                      {block.listType === 'numbered' ? `${item.num}. ` : '• '}
                    </Text>
                    <View style={styles.listItemContent}>
                      <RenderFormattedInlineText text={item.text} baseStyle={styles.listItemText} />
                    </View>
                  </View>
                ))}
              </View>
            );

          case 'callout':
            const isWarning = block.boxType === 'warning' || block.boxType === 'important';
            return (
              <View
                key={idx}
                style={[
                  styles.calloutBox,
                  isWarning ? styles.calloutWarning : styles.calloutInfo
                ]}
              >
                <View style={styles.calloutHeader}>
                  <Text style={styles.calloutIcon}>{block.icon}</Text>
                  <Text style={[styles.calloutTitle, isWarning ? styles.calloutTitleWarn : styles.calloutTitleInfo]}>
                    {block.title}
                  </Text>
                </View>
                <RenderFormattedInlineText text={block.content} baseStyle={styles.calloutText} />
              </View>
            );

          case 'table':
            return (
              <ScrollView key={idx} horizontal showsHorizontalScrollIndicator={false} style={styles.tableScroll}>
                <View style={styles.tableContainer}>
                  {block.rows.map((row, rIdx) => (
                    <View key={rIdx} style={[styles.tableRow, rIdx === 0 && styles.tableHeaderRow]}>
                      {row.map((cell, cIdx) => (
                        <View key={cIdx} style={[styles.tableCell, rIdx === 0 && styles.tableHeaderCell]}>
                          <RenderFormattedInlineText
                            text={cell}
                            baseStyle={rIdx === 0 ? styles.tableHeaderText : styles.tableCellText}
                          />
                        </View>
                      ))}
                    </View>
                  ))}
                </View>
              </ScrollView>
            );

          case 'code':
            return (
              <View key={idx} style={styles.codeBlockContainer}>
                <Text style={styles.codeText}>{block.code}</Text>
              </View>
            );

          case 'quote':
            return (
              <View key={idx} style={styles.quoteBlock}>
                <RenderFormattedInlineText text={block.text} baseStyle={styles.quoteText} />
              </View>
            );

          case 'divider':
            return <View key={idx} style={styles.divider} />;

          default:
            return null;
        }
      })}

      {/* Summary Section */}
      {extractedSummary && (
        <View style={styles.summaryContainer}>
          <View style={styles.headingRow}>
            <Text style={styles.headingText}>✅ Summary</Text>
          </View>
          {extractedSummary.map((pt, sIdx) => (
            <View key={sIdx} style={styles.listItemRow}>
              <Text style={styles.listBulletPrefix}>• </Text>
              <View style={styles.listItemContent}>
                <RenderFormattedInlineText text={pt} baseStyle={styles.listItemText} />
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Follow-Up Questions ("You may also ask") */}
      {followUpQuestions.length > 0 && (
        <View style={styles.followUpContainer}>
          <View style={styles.divider} />
          <Text style={styles.followUpHeader}>❓ You may also ask</Text>
          {followUpQuestions.map((question, qIdx) => (
            <TouchableOpacity
              key={qIdx}
              style={styles.followUpChip}
              onPress={() => onSelectFollowUp && onSelectFollowUp(question)}
              activeOpacity={0.7}
            >
              <Text style={styles.followUpIcon}>💬</Text>
              <Text style={styles.followUpText}>{question}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Footer Disclaimer */}
      {disclaimerText ? (
        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerText}>{disclaimerText}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  baseText: {
    fontSize: 14,
    color: '#2D3748',
    lineHeight: 20,
  },
  boldText: {
    fontWeight: '700',
    color: '#1A202C',
  },
  legalRefChip: {
    backgroundColor: '#E0E7FF',
    color: '#3730A3',
    fontWeight: '700',
    fontSize: 12,
    borderRadius: 4,
    overflow: 'hidden',
  },
  mainTitleRow: {
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 6,
  },
  mainTitleText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A202C',
    lineHeight: 22,
  },
  headingRow: {
    marginTop: 10,
    marginBottom: 6,
  },
  headingText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D3748',
    lineHeight: 20,
  },
  paragraphBox: {
    marginVertical: 4,
  },
  paragraphText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 21,
  },
  listBox: {
    marginVertical: 4,
  },
  listItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6, // Spacing below each list item
  },
  listBulletPrefix: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary || '#8D7865',
    width: 18,
  },
  listItemContent: {
    flex: 1,
  },
  listItemText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
  },
  calloutBox: {
    borderRadius: 8,
    padding: 10,
    marginVertical: 6,
    borderLeftWidth: 4,
  },
  calloutWarning: {
    backgroundColor: '#FFFBEB',
    borderLeftColor: '#F59E0B',
  },
  calloutInfo: {
    backgroundColor: '#EFF6FF',
    borderLeftColor: '#3B82F6',
  },
  calloutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  calloutIcon: {
    fontSize: 14,
  },
  calloutTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  calloutTitleWarn: {
    color: '#B45309',
  },
  calloutTitleInfo: {
    color: '#1D4ED8',
  },
  calloutText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
  },
  tableScroll: {
    marginVertical: 8,
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  tableHeaderRow: {
    backgroundColor: '#F1F5F9',
    borderBottomWidth: 2,
    borderBottomColor: '#CBD5E1',
  },
  tableCell: {
    padding: 8,
    minWidth: 100,
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    justifyContent: 'center',
  },
  tableHeaderCell: {
    borderRightColor: '#CBD5E1',
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  tableCellText: {
    fontSize: 12,
    color: '#334155',
  },
  codeBlockContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 6,
    padding: 10,
    marginVertical: 6,
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 12,
    color: '#38BDF8',
    lineHeight: 16,
  },
  quoteBlock: {
    borderLeftWidth: 3,
    borderLeftColor: '#94A3B8',
    paddingLeft: 10,
    marginVertical: 6,
  },
  quoteText: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#475569',
    lineHeight: 19,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 8,
  },
  summaryContainer: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  followUpContainer: {
    marginTop: 8,
  },
  followUpHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
  },
  followUpChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 6,
    gap: 6,
  },
  followUpIcon: {
    fontSize: 12,
  },
  followUpText: {
    fontSize: 12,
    color: COLORS.primary || '#8D7865',
    fontWeight: '600',
    flex: 1,
  },
  disclaimerBox: {
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  disclaimerText: {
    fontSize: 11,
    color: '#64748B',
    fontStyle: 'italic',
    lineHeight: 15,
  },
});

export default FormattedAIResponse;
