import { describe, it, expect } from 'vitest';
import { ContextService } from '@/features/context-engine/context-service';
import { ContextQualityService } from '@/features/context-engine/context-quality-service';

describe('Context Localization & Cultural Appropriateness (Section 25 & AT05)', () => {
  it('should verify localized Vietnamese contexts in the phenomenon database', () => {
    const phenomena = ContextService.getPhenomena();

    const localItems = phenomena.filter(p => p.context_type === 'LOCAL' || (p.source_country && p.source_country.includes('Việt Nam')));
    expect(localItems.length).toBeGreaterThanOrEqual(4);

    // Check specific localized authentic settings
    const MekongItem = phenomena.find(p => p.title.includes('Đồng bằng sông Cửu Long') || p.description.includes('Đồng bằng sông Cửu Long') || p.title.includes('Tam Nông'));
    expect(MekongItem).toBeDefined();

    const HamLuongItem = phenomena.find(p => p.title.includes('Bến Tre') || p.stimulus?.title?.includes('Hàm Luông') || p.description.includes('Bến Tre'));
    expect(HamLuongItem).toBeDefined();
  });

  it('should ensure all physical quantities and units in stimulus tables follow Vietnam standard SI metrics', () => {
    const stimuli = ContextService.getStimuli();
    expect(stimuli.length).toBeGreaterThan(0);

    const nonMetricForbiddenRegex = /\b(gallon|inches?|miles?|fahrenheit|lbs?)\b/i;

    stimuli.forEach(stim => {
      expect(nonMetricForbiddenRegex.test(stim.content)).toBe(false);
      if (stim.title) {
        expect(nonMetricForbiddenRegex.test(stim.title)).toBe(false);
      }
    });
  });

  it('should validate localized adaptations of international frameworks (OECD PISA, NGSS)', () => {
    const intlList = ContextService.getInternationalContexts();
    const pisaAdaptation = intlList.find(i => i.organization.includes('PISA'));
    expect(pisaAdaptation).toBeDefined();
    expect(pisaAdaptation?.adapted_context).toMatch(/Việt Nam|trường THCS|học sinh/);
  });
});
