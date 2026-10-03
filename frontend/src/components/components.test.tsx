import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { makeResult, makeTest } from '@/test-support/fixtures';
import { createMemoryStore } from '@/lib/storage';
import { TestFlow, type FlowState } from '@/lib/flow/test-flow';
import { AnswerOptions } from './AnswerOptions';
import { AXIS_LABELS } from '@/lib/domain/axis-labels';
import { computeLayout, wrapWords, IMAGE_H, FUTURE_ROW_STEP } from '@/lib/result-image';
import { AXIS_ICON, CLAY_ICONS } from './clay-icons.generated';
import { BipolarAxis, MetricBar, leanCaption, leanSentence } from './BipolarAxis';
import { CopyLinkButton } from './CopyLinkButton';
import { DownloadImageButton } from './DownloadImageButton';
import { ErrorState } from './ErrorState';
import { Explanation } from './Explanation';
import { HomeView } from './HomeView';
import { LoadingState } from './LoadingState';
import { Progress } from './Progress';
import { ResultContent } from './ResultContent';
import { TestPageView, type TestPageActions } from './TestPageView';

const noop = () => {};
const actions: TestPageActions = { select: noop, next: noop, prev: noop, submit: noop, continueFromTransition: noop, reload: noop, start: noop };
const test = makeTest();
const html = (el: React.ReactElement) => renderToStaticMarkup(el);
const text = (h: string) => h.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

function flowAt(answered: number): TestFlow {
  const f = new TestFlow({ storage: createMemoryStore(), test }); f.init();
  for (let i = 0; i < answered; i++) { f.select(1); f.next(); if (f.getState().phase === 'transition') f.continueFromTransition(); }
  return f;
}
const stateAt = (answered: number): FlowState => flowAt(answered).getState();

describe('question + answers (items 1, 2, 13)', () => {
  it('renders the question text and exactly the 5 scale options as native radios in one group', () => {
    const h = html(<TestPageView state={stateAt(4)} actions={actions} />);
    assert.match(h, /<fieldset/); assert.match(h, /<legend/);
    assert.equal((h.match(/type="radio"/g) ?? []).length, 5);
    assert.equal(new Set(h.match(/name="answer-\d+"/g)).size, 1);
    for (const l of test.scale.map((s) => s.label)) assert.ok(h.includes(l), l);
    assert.ok(h.includes('متن گزارهٔ آزمایشی 5'));           // came from the definition passed to the flow, not hard-coded
  });
  it('never shows "question X of 68", a question number, or the total count', () => {
    for (const n of [0, 4, 10, 67]) {
      const t = text(html(<TestPageView state={stateAt(n)} actions={actions} />)).replace(/متن گزارهٔ آزمایشی \d+/g, ''); // fixture text embeds its id; the UI itself must add nothing
      assert.doesNotMatch(t, /از\s*(68|۶۸)/); assert.doesNotMatch(t, /(^|\D)(68|۶۸)(\D|$)/);
      assert.doesNotMatch(t, /سؤال\s*[\d۰-۹]/); assert.doesNotMatch(t, /گزاره\s*[\d۰-۹]+\s*از/);
    }
  });
  it('shows section % and total % from real state', () => {
    const t = text(html(<TestPageView state={stateAt(4)} actions={actions} />));
    assert.match(t, /پیشرفت بخش/); assert.match(t, /پیشرفت کل/);
    assert.match(t, /۴۰٪/); assert.match(t, /۶٪/);         // 4/10 and 4/68
  });
  it('selected option is checked; every radio is inside a <label>; progress bars are named', () => {
    const h = html(<AnswerOptions questionId={3} legend="q" scale={test.scale} value={1} onSelect={noop} />);
    assert.equal((h.match(/checked=""/g) ?? []).length, 1);
    assert.equal((h.match(/<label/g) ?? []).length, 5);
    const p = html(<Progress sectionPercent={40} totalPercent={26} sectionTitle="اقتصاد" />);
    assert.equal((p.match(/role="progressbar"/g) ?? []).length, 2);
    assert.equal((p.match(/aria-label="[^"]+"/g) ?? []).length, 2);
    assert.match(p, /aria-valuenow="40"/); assert.match(p, /aria-valuenow="26"/);
  });
  it('section transition screen names the next section and reports section progress at 0', () => {
    const f = flowAt(0);
    for (let i = 0; i < 10; i++) { f.select(1); f.next(); }
    const t = text(html(<TestPageView state={f.getState()} actions={actions} />));
    assert.match(t, /سکولاریسم/); assert.match(t, /ادامه/); assert.match(t, /۰٪/);
  });
});

describe('error / edge screens (items 6, 14)', () => {
  it('unexpected error offers retry + fresh start; loading → status role', () => {
    const st: FlowState = { ...stateAt(0), phase: 'error', error: { message: 'm', scope: 'load' } };
    const h = html(<TestPageView state={st} actions={actions} />);
    assert.match(h, /تلاش دوباره/); assert.match(h, /شروع آزمون جدید/); assert.match(h, /role="alert"/);
    assert.match(html(<LoadingState />), /role="status"/);
    assert.match(html(<ErrorState message="x" onRetry={noop} />), /role="alert"/);
  });
  it('last question shows the result button (disabled until answered), not "next"', () => {
    const h = html(<TestPageView state={stateAt(67)} actions={actions} />);
    assert.match(h, /مشاهدهٔ نتیجه/); assert.doesNotMatch(text(h), /بعدی/);
    assert.match(h, /disabled=""/);
    const f = flowAt(67); f.select(1);
    const done = html(<TestPageView state={f.getState()} actions={actions} />);
    assert.match(done, /<button[^>]*>مشاهدهٔ نتیجه<\/button>/); assert.doesNotMatch(done, /<button[^>]*disabled=""[^>]*>مشاهدهٔ نتیجه/);
  });
  it('home: fresh / resume / notice', () => {
    const base = { onStart: noop, onResume: noop };
    assert.match(text(html(<HomeView {...base} status={{ kind: 'fresh' }} />)), /شروع آزمون/);
    assert.match(text(html(<HomeView {...base} status={{ kind: 'resume', answeredPercent: 26 }} />)), /۲۶٪[\s\S]*ادامهٔ آزمون/);
    assert.match(text(html(<HomeView {...base} status={{ kind: 'notice', message: 'پاک شدند' }} />)), /پاک شدند/);
    assert.match(html(<HomeView {...base} status={{ kind: 'checking' }} />), /role="status"/);
  });
  it('home never claims data is sent to a server or kept there', () => {
    const t = text(html(<HomeView onStart={noop} onResume={noop} status={{ kind: 'fresh' }} />));
    assert.doesNotMatch(t, /روی سرور/); assert.match(t, /فقط در همین مرورگر/);
  });
});

describe('bipolar axis (item 10)', () => {
  it('shows both poles and places the marker at the value using logical (RTL-safe) properties', () => {
    const h = html(<BipolarAxis poleA="جمهوری" poleB="پادشاهی مشروطه" value={72} />);
    assert.match(h, /جمهوری/); assert.match(h, /پادشاهی مشروطه/);
    assert.match(h, /inset-inline-start:72%/);
    assert.match(h, /role="img"/);
    assert.match(h, /aria-label="[^"]*۷۲[^"]*"/);
  });
  it('50 is the midpoint, values are clamped to 0–100', () => {
    assert.match(html(<BipolarAxis poleA="a" poleB="b" value={50} />), /inset-inline-start:50%/);
    assert.match(html(<BipolarAxis poleA="a" poleB="b" value={140} />), /inset-inline-start:100%/);
    assert.match(html(<BipolarAxis poleA="a" poleB="b" value={-3} />), /inset-inline-start:0%/);
  });
  it('a metric is a single-pole bar (scale ends), not a two-pole axis', () => {
    const h = html(<MetricBar title="نقش رضا پهلوی در گذار" value={25} lowLabel="خیلی مخالفم" highLabel="خیلی موافقم" />);
    assert.match(h, /خیلی مخالفم/); assert.match(h, /خیلی موافقم/); assert.match(h, /inset-inline-start:25%/);
  });
});

describe('lean sentence + axis icons', () => {
  it('reports the share for the closer pole; exactly 50 stays the mathematical midpoint', () => {
    assert.equal(leanSentence('A', 'B', 23), 'شما ۷۷٪ به «A» گرایش دارید.');
    assert.equal(leanSentence('A', 'B', 0), 'شما ۱۰۰٪ به «A» گرایش دارید.');
    assert.equal(leanSentence('A', 'B', 72), 'شما ۷۲٪ به «B» گرایش دارید.');
    assert.match(leanSentence('A', 'B', 50), /نقطهٔ میانی ریاضی/);
  });
  it('compact cards say which pole the percent is toward, right under the percent', () => {
    assert.equal(leanCaption('A', 'B', 23), '۷۷٪ به «A» گرایش دارید');
    assert.equal(leanCaption('A', 'B', 56), '۵۶٪ به «B» گرایش دارید');
    assert.match(leanCaption('A', 'B', 50), /نقطهٔ میانی ریاضی/);
    const h = text(html(<BipolarAxis poleA="نقش دین" poleB="حکومت سکولار" value={56} compact />));
    assert.match(h, /۵۶٪ ۵۶٪ به «حکومت سکولار» گرایش دارید/);
    // the figure under the bar is the SAME number as the sentence (share toward the closer pole), not the raw position
    assert.match(text(html(<BipolarAxis poleA="قدرت غیرانتخابی" poleB="حاکمیت مردم" value={38} compact />)), /۶۲٪ ۶۲٪ به «قدرت غیرانتخابی» گرایش دارید/);
    assert.match(text(html(<BipolarAxis poleA="A" poleB="B" value={23} />)), /۷۷٪ شما ۷۷٪ به «A» گرایش دارید/);
  });
  it('copy and download buttons keep their text and get a decorative icon', () => {
    const copy = html(<CopyLinkButton />);
    const dl = html(<DownloadImageButton input={{ general: [], future: [], distanceFromStatusQuo: 0 }} />);
    for (const h of [copy, dl]) assert.match(h, /<svg[^>]*aria-hidden="true"/);
    assert.match(text(copy), /کپی نشانی نتیجه/);
    assert.match(text(dl), /دانلود تصویر نتیجه/);
  });
  it('every axis has an icon that exists in the generated Clay set', () => {
    for (const id of Object.keys(AXIS_LABELS)) assert.ok(CLAY_ICONS[AXIS_ICON[id]], id);
  });
});

describe('share image layout (9:16)', () => {
  it('17 general + 6 future rows fit in 1080×1920, sections stacked without overlap', () => {
    const L = computeLayout(17, 6);
    assert.ok(L.fits);
    assert.ok(L.generalTop < L.generalBottom && L.generalBottom < L.futureTop);
    assert.ok(L.futureTop < L.futureBottom && L.futureBottom < L.footerY);
    assert.ok(L.footerY + 120 <= IMAGE_H);
  });
  it('layout is fixed: general count does not move anything; the future panel grows by one row step per extra row', () => {
    assert.deepEqual(computeLayout(30, 6), computeLayout(17, 6));
    assert.equal(computeLayout(17, 8).futureBottom, computeLayout(17, 6).futureBottom + FUTURE_ROW_STEP);
  });
  it('reports fits=false instead of silently overflowing when the future section is too tall', () => {
    assert.equal(computeLayout(17, 8).fits, false);
    assert.equal(computeLayout(17, 10).fits, false);
  });
  it('wraps words greedily by measured width', () => {
    const m = (s: string) => s.length * 10;
    assert.deepEqual(wrapWords(m, 'کنترل اداری / شفافیت محدود', 130), ['کنترل اداری /', 'شفافیت محدود']);
    assert.deepEqual(wrapWords(m, 'کوتاه', 130), ['کوتاه']);
  });
});

describe('result page (items 9–12)', () => {
  const view = (o = {}) => html(<ResultContent result={makeResult(o)} test={test} />);

  it('renders 17 general axis cards and a SEPARATE future-government section with 6 independent items', () => {
    const h = view();
    const idx = h.indexOf('data-testid="future-government"');
    assert.ok(idx > 0);
    const before = h.slice(0, idx), after = h.slice(idx);
    assert.equal((before.match(/data-axis="/g) ?? []).length, 17);
    assert.equal((after.match(/data-axis="/g) ?? []).length, 6);
    for (const a of ['future_government_form', 'transition_leadership', 'transition_speed', 'accountability_vs_reconciliation', 'democratic_choice', 'reza_pahlavi_transition_role']) {
      assert.ok(after.includes(`data-axis="${a}"`), a);
      assert.ok(!before.includes(`data-axis="${a}"`), `${a} must not be in general axes`);
    }
    assert.match(text(h), /آینده\u0654? حکومت/);
    assert.match(text(h), /در هیچ عدد یا نتیجهٔ کلی ترکیب نشده/);
  });
  it('metrics are titled per spec and rendered as metrics, not axes', () => {
    const h = view();
    assert.match(h, /نقش رضا پهلوی در گذار/); assert.match(h, /فرایند دموکراتیک تعیین شکل حکومت/);
    assert.match(h, /مورد مستقل و تک‌قطبی/);
  });
  it('shows certainty and distance exactly as computed (rounded for display only)', () => {
    const t = text(view());
    assert.match(t, /قطعیت پاسخ‌ها ۸۲٪/); assert.match(t, /فاصله از وضع موجود ۴۷٪/);
  });
  it('NO overall score, political label, camp, or ranking anywhere (item 12)', () => {
    const t = text(view());
    for (const bad of ['چپ', 'راست', 'محافظه‌کار', 'لیبرال', 'اصلاح‌طلب', 'اصولگرا', 'جمهوری‌خواه', 'سلطنت‌طلب', 'گرایش سیاسی', 'رتبه', 'شما یک ', 'مجموع', 'میانگین کل']) {
      assert.ok(!t.includes(bad), `forbidden text: ${bad}`);
    }
    assert.doesNotMatch(view(), /radar|spider|data-testid="overall/i);
  });
  it('explanation: exact scoring data, question text from definition, ≤4 items, no weights shown', () => {
    const five = Array.from({ length: 5 }, (_, i) => ({ questionId: i + 1, response: 2 as const, weight: 0.987, signedResponse: 2, weightedContribution: 1.234 }));
    const h = renderToStaticMarkup(<Explanation contributions={five} target={{ kind: 'axis', poleA: 'الف', poleB: 'ب' }} ctx={{ questionTexts: { 1: 'متن ۱' }, scaleLabels: { 2: 'خیلی موافقم' } }} />);
    assert.equal((h.match(/<li/g) ?? []).length, 4);
    assert.match(h, /توضیح محاسبهٔ نتیجه/); assert.match(h, /«متن ۱»/); assert.match(h, /پاسخ شما: خیلی موافقم/);
    assert.doesNotMatch(h, /0\.987|1\.234|۰٫۹۸۷/);
    const neg = renderToStaticMarkup(<Explanation contributions={[{ questionId: 1, response: 2, weight: 1, signedResponse: -2, weightedContribution: -2 }]} target={{ kind: 'axis', poleA: 'الف', poleB: 'ب' }} ctx={{ questionTexts: null, scaleLabels: {} }} />);
    assert.match(neg, /به سمت «الف»/); assert.match(neg, /در دسترس نیست/);
  });
  it('empty explanation (e.g. every answer neutral) shows an honest note instead of an empty section', () => {
    const t = text(view({ explanation: {} }));
    assert.match(t, /پاسخ اثرگذاری برای نمایش وجود ندارد/);
    assert.doesNotMatch(t, /توضیح محاسبهٔ نتیجه\s*«/);
  });
  it('foreign_intervention gets only the neutral, spec-derived note', () => {
    assert.match(text(view()), /فقط به قطب «کاهش مداخله خارجی» اشاره می‌کنند/);
    assert.match(text(view()), /فقط به قطب «تأکید بر هویت ایرانی» اشاره می‌کنند/);
  });
  it('reminds the user to keep the link, says nothing is stored, and warns that the link contains the answers', () => {
    const t = text(view());
    assert.match(t, /نشانی این صفحه را نگه دارید/); assert.match(t, /جای دیگری ذخیره نشده/);
    assert.match(t, /پاسخ‌های شما به همهٔ گزاره‌ها داخل همین نشانی/);
  });
});

describe('RTL + static checks (item 13)', () => {
  const src = (p: string) => readFileSync(resolve(__dirname, p), 'utf8');
  it('root layout is fa + rtl', () => {
    const l = src('../app/layout.tsx');
    assert.match(l, /lang="fa"/); assert.match(l, /dir="rtl"/);
  });
  it('components use logical properties, not physical left/right', () => {
    for (const f of ['BipolarAxis.tsx', 'AnswerOptions.tsx', 'Progress.tsx', 'QuestionCard.tsx', 'ResultContent.tsx']) {
      assert.doesNotMatch(src(f), /\b(text-left|text-right|ml-|mr-|pl-|pr-|left-|right-)\d?/, f);
    }
  });
  it('no localStorage use outside storage.ts; only the unfinished draft is persisted (never the result)', () => {
    for (const f of ['HomeClient.tsx', 'ResultClient.tsx', 'TestClient.tsx', 'ResultContent.tsx', '../hooks/use-test-flow.ts', '../lib/flow/test-flow.ts', '../lib/result/compute.ts', '../lib/result/codec.ts']) {
      assert.doesNotMatch(src(f), /localStorage|sessionStorage/, f);
    }
    assert.match(src('../lib/storage.ts'), /ipv\.draft\.v1/);
    assert.equal((src('../lib/storage.ts').match(/setItem\(/g) ?? []).length, 1);
  });
  it('the site is static: no source file makes a network request or opens a socket', () => {
    const walk = (d: string): string[] => readdirSync(d).flatMap((n) => {
      const p = resolve(d, n);
      return statSync(p).isDirectory() ? walk(p) : /\.(ts|tsx)$/.test(n) && !/\.test\./.test(n) ? [p] : [];
    });
    for (const f of walk(resolve(__dirname, '..'))) {
      assert.doesNotMatch(readFileSync(f, 'utf8'), /\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource|NEXT_PUBLIC_API|API_BASE_URL/, f);
    }
  });
  it('UI and flow code carry no weights/agreementMeans (scoring lives only in lib/definition)', () => {
    for (const f of ['../lib/flow/test-flow.ts', '../lib/domain/result-view.ts', '../lib/domain/progress.ts']) assert.doesNotMatch(src(f), /agreementMeans|distanceWeight/, f);
  });
});
