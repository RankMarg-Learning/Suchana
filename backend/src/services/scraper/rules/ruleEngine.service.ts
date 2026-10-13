import fs from 'fs';
import path from 'path';
import { SarkariResultRules } from './scraperRules.types';
import { logger } from '../../../utils/logger';

export class RuleEngineService {
    private static cachedRules: SarkariResultRules | null = null;
    private static rulesPath = path.resolve(__dirname, '../../../config/rules/sarkariresult.rules.json');

    static getRules(): SarkariResultRules {
        if (!this.cachedRules) {
            this.loadRules();
        }
        return this.cachedRules!;
    }

    static loadRules(): SarkariResultRules {
        try {
            if (!fs.existsSync(this.rulesPath)) {
                throw new Error(`Rules file not found at ${this.rulesPath}`);
            }
            const raw = fs.readFileSync(this.rulesPath, 'utf-8');
            const parsed = JSON.parse(raw) as SarkariResultRules;
            this.cachedRules = parsed;
            logger.info(`[RuleEngine] Successfully loaded rules version ${parsed.version} from ${this.rulesPath}`);
            return parsed;
        } catch (err: any) {
            logger.error(`[RuleEngine] Failed to load rules file: ${err.message}`);
            throw err;
        }
    }

    static updateRules(newRules: SarkariResultRules): void {
        try {
            fs.writeFileSync(this.rulesPath, JSON.stringify(newRules, null, 2), 'utf-8');
            this.cachedRules = newRules;
            logger.info(`[RuleEngine] Rules file successfully updated and reloaded.`);
        } catch (err: any) {
            logger.error(`[RuleEngine] Failed to save updated rules: ${err.message}`);
            throw err;
        }
    }
}
