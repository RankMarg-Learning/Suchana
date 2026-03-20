import { AD_UNIT_IDS } from './Ads';

export type AdPlacement = 
  | 'HOME_TOP'
  | 'HOME_MIDDLE'
  | 'HOME_RECENT_UPDATED'
  | 'HOME_FOOTER'
  | 'HOME_FOOTER_NATIVE'
  | 'EXAM_DETAILS_HEADER'
  | 'EXAM_DETAILS_BOTTOM'
  | 'SAVED_TOP'
  | 'SAVED_FOOTER'
  | 'SAVED_FOOTER_NATIVE'
  | 'PROFILE_MIDDLE'
  | 'PROFILE_BOTTOM';

export interface AdConfig {
  enabled: boolean;
  adUnitId: string;
}

export const ADS_CONFIG: Record<AdPlacement, AdConfig> = {
  HOME_TOP: {
    enabled: true,
    adUnitId: AD_UNIT_IDS.NATIVE,
  },
  HOME_MIDDLE: {
    enabled: true,
    adUnitId: AD_UNIT_IDS.BANNER,
  },
  HOME_RECENT_UPDATED: {
    enabled: true,
    adUnitId: AD_UNIT_IDS.NATIVE,
  },
  HOME_FOOTER: {
    enabled: true,
    adUnitId: AD_UNIT_IDS.BANNER,
  },
  HOME_FOOTER_NATIVE: {
    enabled: true,
    adUnitId: AD_UNIT_IDS.NATIVE,
  },
  EXAM_DETAILS_HEADER: {
    enabled: true,
    adUnitId: AD_UNIT_IDS.BANNER,
  },
  EXAM_DETAILS_BOTTOM: {
    enabled: true,
    adUnitId: AD_UNIT_IDS.NATIVE,
  },
  SAVED_TOP: {
    enabled: true,
    adUnitId: AD_UNIT_IDS.NATIVE,
  },
  SAVED_FOOTER: {
    enabled: true,
    adUnitId: AD_UNIT_IDS.BANNER,
  },
  SAVED_FOOTER_NATIVE: {
    enabled: true,
    adUnitId: AD_UNIT_IDS.NATIVE,
  },
  PROFILE_MIDDLE: {
    enabled: true,
    adUnitId: AD_UNIT_IDS.NATIVE,
  },
  PROFILE_BOTTOM: {
    enabled: true,
    adUnitId: AD_UNIT_IDS.BANNER,
  },
};

export const GLOBAL_ADS_ENABLED = true;
