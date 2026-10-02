import { describe, it, expect } from 'vitest';
import { ContextService } from '@/features/context-engine/context-service';

describe('International Sources & License Provenance (Section 11, 12 & AT02, AT10)', () => {
  it('AT02: should verify configured major international scientific sources', () => {
    const intlList = ContextService.getInternationalContexts();

    const expectedOrgs = ['NOAA', 'WHO', 'PISA', 'EPA', 'IRRI'];

    expectedOrgs.forEach(org => {
      const found = intlList.some(item => item.organization.toUpperCase().includes(org));
      expect(found).toBe(true);
    });
  });

  it('should verify license integrity and attribution status', () => {
    const stimuli = ContextService.getStimuli();

    stimuli.forEach(stim => {
      stim.sourceRefs.forEach(ref => {
        expect(['OPEN_LICENSE', 'PUBLIC_DOMAIN', 'PERMISSION_REQUIRED', 'UNKNOWN']).toContain(ref.licenseStatus);
        expect(['VERIFIED', 'UNVERIFIED']).toContain(ref.verificationStatus);
        expect(typeof ref.attributionRequired).toBe('boolean');
      });
    });
  });

  it('should verify source URL format for international contexts', () => {
    const intlList = ContextService.getInternationalContexts();

    intlList.forEach(item => {
      expect(item.source_url).toMatch(/^https?:\/\//);
      expect(item.license).toBeDefined();
    });
  });
});
