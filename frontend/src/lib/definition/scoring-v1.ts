// Test Definition v1.0 — scoring mapping (IMMUTABLE). Question texts live in questions-v1.ts (not yet added).
export type Means = 'farther' | 'closer' | 'none';
export interface AxisDef { poleA: string | null; poleB: string; type: 'axis' | 'metric' }
export interface Loading { axis: string; pole: string; weight: number }
export interface QuestionScoring { id: number; section: number; scoring: Loading[]; distance: { weight: number; agreementMeans: Means } }

const ax = (poleA: string, poleB: string): AxisDef => ({ poleA, poleB, type: 'axis' });
const metric = (poleB: string): AxisDef => ({ poleA: null, poleB, type: 'metric' });

export const AXES: Record<string, AxisDef> = {
  individual_freedom: ax('government_restriction', 'individual_freedom'),
  citizen_equality: ax('unequal_rights', 'equal_rights'),
  secularism: ax('religious_role', 'secular_government'),
  democracy: ax('non_elected_power', 'popular_rule'),
  rule_of_law: ax('power_without_accountability', 'accountability'),
  market_vs_state: ax('market', 'state_intervention'),
  limited_vs_service_state: ax('limited_state', 'service_oriented_state'),
  identity_emphasis: ax('subnational_identity_emphasis', 'iranian_national_identity'),
  assimilation_vs_pluralism: ax('assimilation', 'pluralism'),
  decentralization: ax('centralization', 'local_authority'),
  immigration: ax('immigration_control', 'immigration_openness'),
  west_engagement: ax('strategic_distance_from_west', 'western_engagement'),
  regional_role: ax('limited_regional_role', 'active_regional_role'),
  // SPEC NOTE: no v1.0 question loads on pole B (foreign_intervention_support); axis is effectively one-sided.
  foreign_intervention: ax('reduced_foreign_intervention', 'foreign_intervention_support'),
  defense_capability: ax('limited_defense_capability', 'strong_defense_deterrence'),
  military_political_role: ax('non_political_military', 'political_military'),
  // SPEC NOTE: pole B named differently in §5 and Q55; treated as one pole.
  governance: ax('administrative_control_limited_transparency', 'accountability_and_local_authority'),
  transition_speed: ax('rapid_transition', 'gradual_transition'),
  transition_leadership: ax('centralized_leadership', 'collective_leadership'),
  accountability_vs_reconciliation: ax('reconciliation', 'accountability_and_prosecution'),
  future_government_form: ax('republic', 'constitutional_monarchy'),
  democratic_choice: metric('democratic_choice'),
  reza_pahlavi_transition_role: metric('transition_role_support'),
};

const S = {
  IF: 'individual_freedom', CE: 'citizen_equality', SEC: 'secularism', DEM: 'democracy', ROL: 'rule_of_law',
  MVS: 'market_vs_state', LVS: 'limited_vs_service_state', ID: 'identity_emphasis', AP: 'assimilation_vs_pluralism',
  DEC: 'decentralization', IMM: 'immigration', WE: 'west_engagement', RR: 'regional_role', FI: 'foreign_intervention',
  DC: 'defense_capability', MPR: 'military_political_role', GOV: 'governance', TS: 'transition_speed',
  TL: 'transition_leadership', AVR: 'accountability_vs_reconciliation', FGF: 'future_government_form',
  DCH: 'democratic_choice', RP: 'reza_pahlavi_transition_role',
};
type L = [string, string, number?];
const q = (id: number, section: number, loads: L[], w: number, m: Means): QuestionScoring => ({
  id, section,
  scoring: loads.map(([axis, pole, weight], i) => ({ axis, pole, weight: weight ?? (i === 0 ? 1 : 0.25) })),
  distance: { weight: w, agreementMeans: m },
});
const gr = 'government_restriction', er = 'equal_rights', pr = 'popular_rule', acc = 'accountability', pwa = 'power_without_accountability';

export const QUESTIONS: QuestionScoring[] = [
  q(1,1,[[S.IF,gr]],1,'closer'), q(2,1,[[S.IF,'individual_freedom']],1,'farther'), q(3,1,[[S.IF,gr]],1,'closer'),
  q(4,1,[[S.IF,gr]],1,'closer'), q(5,1,[],0.5,'closer'),
  q(6,1,[[S.IF,gr,1],[S.SEC,'religious_role',0.5]],0.5,'closer'),
  q(7,1,[[S.CE,er,1],[S.DEM,pr,0.25]],1,'farther'), q(8,1,[[S.CE,er]],1,'farther'),
  q(9,1,[[S.IF,'individual_freedom',1],[S.ROL,acc,0.25]],1,'farther'), q(10,1,[[S.CE,er]],1,'farther'),
  q(11,2,[[S.SEC,'secular_government',1],[S.CE,er,0.25]],1,'farther'),
  q(12,2,[[S.SEC,'secular_government',1],[S.CE,er,0.25]],1,'farther'),
  q(13,2,[[S.SEC,'secular_government',1],[S.DEM,pr,0.25]],1,'farther'),
  q(14,2,[[S.SEC,'religious_role']],1,'closer'),
  q(15,3,[[S.ROL,acc]],1,'farther'), q(16,3,[[S.ROL,acc,1],[S.DEM,pr,0.25]],1,'farther'),
  q(17,3,[[S.DEM,pr,1],[S.ROL,acc,0.25]],1,'farther'), q(18,3,[[S.IF,'individual_freedom',1],[S.ROL,acc,0.25]],1,'farther'),
  q(19,3,[[S.ROL,pwa]],1,'closer'), q(20,3,[[S.ROL,acc,1],[S.DEM,pr,0.25]],1,'farther'), q(21,3,[[S.ROL,acc]],1,'farther'),
  q(22,4,[[S.MVS,'state_intervention']],0,'none'), q(23,4,[[S.MVS,'market']],0.25,'farther'),
  q(24,4,[[S.MVS,'state_intervention']],0,'none'),
  q(25,4,[[S.MVS,'state_intervention',0.25]],0,'none'),
  q(26,4,[[S.MVS,'market']],0.25,'farther'), q(27,4,[[S.MVS,'state_intervention']],0.25,'closer'),
  q(28,4,[[S.LVS,'limited_state',1],[S.MVS,'market',0.25]],0.25,'farther'),
  q(29,4,[[S.MVS,'state_intervention',1],[S.ROL,pwa,0.25]],0.5,'farther'),
  q(30,5,[[S.ID,'iranian_national_identity']],0,'none'), q(31,5,[[S.AP,'pluralism',0.25]],0,'none'),
  q(32,5,[[S.AP,'assimilation']],0,'none'),
  q(33,5,[[S.AP,'pluralism',1],[S.CE,er,0.25]],0.5,'farther'),
  q(34,5,[[S.DEC,'centralization']],0,'none'), q(35,5,[[S.DEC,'centralization']],0.25,'farther'),
  q(36,5,[[S.ID,'iranian_national_identity',1],[S.DEC,'centralization',0.25]],0,'none'),
  q(37,6,[[S.IMM,'immigration_control']],0,'none'), q(38,6,[[S.IMM,'immigration_openness']],0.25,'farther'),
  q(39,6,[[S.IMM,'immigration_control',1],[S.CE,'unequal_rights',0.25]],0,'none'),
  q(40,6,[[S.IMM,'immigration_control',1],[S.ROL,acc,0.25]],0,'none'),
  q(41,6,[[S.IMM,'immigration_control']],0.25,'closer'),
  q(42,7,[[S.WE,'western_engagement']],0.5,'farther'), q(43,7,[[S.WE,'strategic_distance_from_west']],0.25,'closer'),
  q(44,7,[[S.WE,'western_engagement']],0.5,'farther'), q(45,7,[[S.RR,'limited_regional_role'],[S.DC,'limited_defense_capability',0.25]],0.75,'farther'),
  q(46,7,[[S.RR,'active_regional_role']],0.25,'closer'),
  q(47,7,[[S.WE,'western_engagement',1],[S.RR,'active_regional_role',0.25]],0.75,'farther'),
  q(48,8,[[S.DC,'limited_defense_capability']],0.25,'farther'),
  q(49,8,[[S.MPR,'non_political_military',1],[S.DEM,pr,0.25]],1,'farther'),
  q(50,8,[[S.DC,'strong_defense_deterrence']],0,'none'),
  q(51,8,[[S.FI,'reduced_foreign_intervention',1],[S.RR,'limited_regional_role',0.25]],0.5,'farther'),
  q(52,8,[[S.FI,'reduced_foreign_intervention',1],[S.RR,'limited_regional_role',0.25]],0.75,'farther'),
  q(53,9,[[S.LVS,'service_oriented_state'],[S.MVS,'state_intervention',0.25]],0.25,'farther'), q(54,9,[[S.LVS,'limited_state',0.25]],0,'none'),
  q(55,9,[[S.DEC,'local_authority',1],[S.GOV,'accountability_and_local_authority',0.25]],0.25,'farther'),
  q(56,9,[[S.LVS,'limited_state',0.25]],0.25,'closer'),
  q(57,9,[[S.GOV,'administrative_control_limited_transparency',1],[S.ROL,pwa,0.25]],0.75,'closer'),
  q(58,10,[[S.TS,'rapid_transition',1],[S.DEM,pr,0.25]],1,'farther'),
  q(59,10,[[S.TL,'centralized_leadership']],0.5,'closer'), q(60,10,[[S.TL,'collective_leadership']],0.75,'farther'),
  q(61,10,[[S.TS,'gradual_transition']],0.25,'farther'), q(62,10,[[S.FGF,'republic',1]],0.5,'farther'),
  q(63,10,[[S.DCH,'democratic_choice',1],[S.DEM,pr,0.25]],1,'farther'),
  q(64,10,[[S.RP,'transition_role_support']],1,'farther'),
  q(65,10,[[S.AVR,'accountability_and_prosecution',1],[S.ROL,acc,0.25]],1,'farther'),
  q(66,10,[[S.FGF,'constitutional_monarchy',1]],0.75,'farther'),
  q(67,10,[[S.FGF,'constitutional_monarchy']],0.25,'farther'),
  q(68,10,[[S.FGF,'constitutional_monarchy',1]],0.25,'farther'),
];

export const TEST_VERSION = '1.0';
const deepFreeze = <T,>(o: T): T => { if (o && typeof o === 'object') { Object.values(o).forEach(deepFreeze); Object.freeze(o); } return o; };
export const DEFINITION_V1 = deepFreeze({ version: TEST_VERSION, axes: AXES, questions: QUESTIONS });
export type TestDefinition = typeof DEFINITION_V1;
