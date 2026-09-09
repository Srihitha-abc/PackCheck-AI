import { useEffect, useState } from 'react';
import { ChevronRight, Plus, Search, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export function RuleDetailsModal({ rule, onClose }) {
  if (!rule) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="eyebrow">RULE DETAILS</p>
            <h2>{rule.title}</h2>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="detail-section">
            <h3>Identification</h3>
            <div className="detail-row">
              <label>Internal Rule ID</label>
              <span>{rule.ruleId}</span>
            </div>
            <div className="detail-row">
              <label>Official Legal Reference</label>
              <span>{rule.legalReference || 'Not specified'}</span>
            </div>
            {rule.legalSource && (
              <div className="detail-row">
                <label>Legal Source</label>
                <span>{rule.legalSource}</span>
              </div>
            )}
          </div>

          <div className="detail-section">
            <h3>Description & Validation</h3>
            <div className="detail-row">
              <label>Description</label>
              <span>{rule.description || 'No description'}</span>
            </div>
            <div className="detail-row">
              <label>Declaration</label>
              <span>{rule.declaration}</span>
            </div>
            <div className="detail-row">
              <label>Validation Type</label>
              <span className="tag">{rule.validationType}</span>
            </div>
            {rule.expectedPattern && (
              <div className="detail-row">
                <label>Expected Pattern</label>
                <code>{rule.expectedPattern}</code>
              </div>
            )}
          </div>

          <div className="detail-section">
            <h3>Compliance Configuration</h3>
            <div className="detail-row">
              <label>Category</label>
              <span className="tag">{rule.category || 'General'}</span>
            </div>
            {rule.subCategory && (
              <div className="detail-row">
                <label>Sub-category</label>
                <span>{rule.subCategory}</span>
              </div>
            )}
            <div className="detail-row">
              <label>Severity</label>
              <span className={`severity ${rule.severity}`}>{rule.severity}</span>
            </div>
            <div className="detail-row">
              <label>Automation Level</label>
              <span className="tag">{rule.automationLevel || 'FULLY_AUTOMATED'}</span>
            </div>
            <div className="detail-row">
              <label>Officer Review Required</label>
              <span>{rule.officerReviewRequired ? 'Yes' : 'No'}</span>
            </div>
          </div>

          <div className="detail-section">
            <h3>Version & Effectivity</h3>
            <div className="detail-row">
              <label>Version</label>
              <span>{rule.version || '1.0'}</span>
            </div>
            <div className="detail-row">
              <label>Effective Date</label>
              <span>{rule.effectiveDate ? new Date(rule.effectiveDate).toLocaleDateString() : 'Ongoing'}</span>
            </div>
            {rule.expiryDate && (
              <div className="detail-row">
                <label>Expiry Date</label>
                <span>{new Date(rule.expiryDate).toLocaleDateString()}</span>
              </div>
            )}
            {rule.amendmentReference && (
              <div className="detail-row">
                <label>Amendment Reference</label>
                <span>{rule.amendmentReference}</span>
              </div>
            )}
          </div>

          <div className="detail-section">
            <h3>Source & Verification</h3>
            {rule.officialSourceName && (
              <div className="detail-row">
                <label>Official Source</label>
                <span>{rule.officialSourceName}</span>
              </div>
            )}
            {rule.sourceDocument && (
              <div className="detail-row">
                <label>Source Document</label>
                <span>{rule.sourceDocument}</span>
              </div>
            )}
            {rule.lastVerifiedDate && (
              <div className="detail-row">
                <label>Last Verified</label>
                <span>{new Date(rule.lastVerifiedDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          <div className="disclaimer">
            <p>
              <strong>Disclaimer:</strong> This automated validation is a compliance screening result. 
              Final legal interpretation and enforcement decision require authorized officer review.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Rules() {
  const { user } = useAuth();
  const [rules, setRules] = useState([]);
  const [selectedRule, setSelectedRule] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [automationFilter, setAutomationFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    api.get('/rules').then(({ data }) => setRules(data.rules)).catch(e => console.error(e));
  }, []);

  // Calculate statistics
  const stats = {
    total: rules.length,
    active: rules.filter(r => r.active).length,
    inactive: rules.filter(r => !r.active).length,
    mandatory: rules.filter(r => r.category === 'MANDATORY_DECLARATION').length,
    officerReview: rules.filter(r => r.officerReviewRequired).length,
  };

  // Get unique categories
  const categories = ['ALL', ...new Set(rules.map(r => r.category || 'General'))];
  const severities = ['ALL', ...new Set(rules.map(r => r.severity))];
  const automationLevels = ['ALL', ...new Set(rules.map(r => r.automationLevel || 'FULLY_AUTOMATED'))];

  // Filter rules
  const filtered = rules.filter(rule => {
    const matchesSearch = !searchTerm || 
      rule.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.ruleId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.declaration?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.legalReference?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'ALL' || rule.category === categoryFilter;
    const matchesSeverity = severityFilter === 'ALL' || rule.severity === severityFilter;
    const matchesAutomation = automationFilter === 'ALL' || (rule.automationLevel || 'FULLY_AUTOMATED') === automationFilter;
    const matchesStatus = statusFilter === 'ALL' || 
      (statusFilter === 'ACTIVE' && rule.active) ||
      (statusFilter === 'INACTIVE' && !rule.active);

    return matchesSearch && matchesCategory && matchesSeverity && matchesAutomation && matchesStatus;
  });

  return (
    <>
      <div className="page-intro">
        <div>
          <p className="eyebrow">GOVERNANCE & COMPLIANCE</p>
          <h1>Compliance rules</h1>
          <p className="muted">
            Versioned rule references used by the screening engine. 
            Based on Legal Metrology (Packaged Commodities) Rules, 2011.
          </p>
        </div>
        {user?.role === 'ADMIN' && <button className="button primary"><Plus size={18}/> Add rule</button>}
      </div>

      <div className="stats-grid">
        <div className="stat">
          <div className="stat-icon blue"><Activity size={18}/></div>
          <div>
            <span>Total Rules</span>
            <strong>{stats.total}</strong>
            <small>{stats.active} active</small>
          </div>
        </div>
        <div className="stat">
          <div className="stat-icon green"><Activity size={18}/></div>
          <div>
            <span>Mandatory Declaration</span>
            <strong>{stats.mandatory}</strong>
            <small>Core requirements</small>
          </div>
        </div>
        <div className="stat">
          <div className="stat-icon amber"><Activity size={18}/></div>
          <div>
            <span>Requires Officer Review</span>
            <strong>{stats.officerReview}</strong>
            <small>Complex validation</small>
          </div>
        </div>
        <div className="stat">
          <div className="stat-icon gray"><Activity size={18}/></div>
          <div>
            <span>Inactive Rules</span>
            <strong>{stats.inactive}</strong>
            <small>Historical versions</small>
          </div>
        </div>
      </div>

      <section className="panel table-panel">
        <div className="table-toolbar">
          <div className="search-box">
            <Search size={17}/>
            <input 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search rule name, ID, declaration, or legal reference"
            />
          </div>
          <span className="tag">{filtered.length} of {rules.length} rules</span>
        </div>

        <div className="filter-bar">
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
            <option value="ALL">All Categories</option>
            {categories.filter(c => c !== 'ALL').map(cat => (
              <option key={cat} value={cat}>{cat.replace(/_/g, ' ')}</option>
            ))}
          </select>

          <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)}>
            <option value="ALL">All Severities</option>
            {severities.filter(s => s !== 'ALL').map(sev => (
              <option key={sev} value={sev}>{sev.charAt(0).toUpperCase() + sev.slice(1)}</option>
            ))}
          </select>

          <select value={automationFilter} onChange={e => setAutomationFilter(e.target.value)}>
            <option value="ALL">All Automation Levels</option>
            {automationLevels.filter(a => a !== 'ALL').map(aut => (
              <option key={aut} value={aut}>{aut.replace(/_/g, ' ')}</option>
            ))}
          </select>

          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>
        </div>

        {filtered.length > 0 ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Rule</th>
                  <th>Declaration</th>
                  <th>Category</th>
                  <th>Validation</th>
                  <th>Severity</th>
                  <th>Automation</th>
                  <th>Version</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(rule => (
                  <tr key={rule._id}>
                    <td>
                      <div>
                        <strong>{rule.title}</strong>
                        <small className="table-sub">{rule.ruleId}</small>
                      </div>
                    </td>
                    <td><code>{rule.declaration}</code></td>
                    <td><span className="tag small">{(rule.category || 'General').replace(/_/g, ' ')}</span></td>
                    <td>{rule.validationType}</td>
                    <td><span className={`severity ${rule.severity}`}>{rule.severity}</span></td>
                    <td><span className="tag small">{(rule.automationLevel || 'FULLY_AUTOMATED').replace(/_/g, ' ')}</span></td>
                    <td>{rule.version || '1.0'}</td>
                    <td>
                      <span className={`pill ${rule.active ? 'found' : 'missing'}`}>
                        {rule.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="icon-link"
                        onClick={() => setSelectedRule(rule)}
                        title="View details"
                      >
                        <ChevronRight size={17}/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty">
            <p>No rules match your filters.</p>
          </div>
        )}
      </section>

      <RuleDetailsModal rule={selectedRule} onClose={() => setSelectedRule(null)} />
    </>
  );
}

import { Activity } from 'lucide-react';
export default Rules;
