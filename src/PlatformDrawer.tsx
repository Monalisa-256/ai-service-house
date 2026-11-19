import platforms from '../content/platforms.json';

/** Dated documentation links, kept separate from the fictional case mechanics. */
export function PlatformDrawer() {
  return <details className="platform-drawer"><summary>Platform documentation</summary><p>Reviewed {platforms.reviewedOn}. {platforms.scope} The fictional case does not call any provider.</p><ul>{platforms.entries.map(entry => <li key={entry.name}><strong>{entry.name}</strong><span>{entry.concept}</span><p>{entry.designImplication}</p><a href={entry.officialUrl} target="_blank" rel="noopener noreferrer">Read official documentation ↗</a></li>)}</ul></details>;
}
