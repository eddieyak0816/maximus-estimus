import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAssessmentStore } from '../store/assessmentStore';
import { formatCurrency, formatDate } from '../utils/calculations';
import { estimateTotals } from '../utils/estimateEngine';
import { getPhotoUrl } from '../utils/photoStorage';
import SectionCard from '../components/SectionCard';
import StatusBadge from '../components/StatusBadge';
import type {
  JobInstance, EstimateData,
  KitchenMeasurements, KitchenQuestions, KitchenPhotos,
  BathroomMeasurements, BathroomQuestions, BathroomPhotos,
  FlooringMeasurements, FlooringQuestions, FlooringPhotos,
  LivingRoomMeasurements, LivingRoomQuestions, LivingRoomPhotos,
  BedroomMeasurements, BedroomQuestions, BedroomPhotos,
  DeckMeasurements, DeckQuestions, DeckPhotos,
  OtherAssessment, WallData
} from '../types';

// ── Helpers ───────────────────────────────────────────────────────────────

function wallLabel(i: number): string {
  const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return i < 26 ? A[i] : A[Math.floor(i / 26) - 1] + A[i % 26];
}

function Row({ label, value }: { label: string; value?: string | number | boolean | null }) {
  if (value === undefined || value === null || value === '' || value === 0) return null;
  const display = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value);
  return (
    <div className="summary-row">
      <span className="summary-label">{label}</span>
      <span className="summary-value">{display}</span>
    </div>
  );
}

function PhotoItem({ label, photoId }: { label: string; photoId?: string }) {
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!photoId) {
      setThumbUrl(null);
      return;
    }

    let mounted = true;
    getPhotoUrl(photoId).then(url => {
      if (mounted) setThumbUrl(url);
    });

    return () => {
      mounted = false;
      if (thumbUrl) URL.revokeObjectURL(thumbUrl);
    };
  }, [photoId]);

  const taken = !!photoId;
  return (
    <div className={`photo-check-row ${taken ? 'taken' : 'missing'}`}>
      {thumbUrl ? (
        <img
          src={thumbUrl}
          alt={label}
          className="photo-check-thumb"
          style={{ width: 24, height: 24, borderRadius: 4, objectFit: 'cover' }}
        />
      ) : (
        <span className="photo-check-icon">{taken ? '✓' : '○'}</span>
      )}
      <span className="photo-check-label">{label}</span>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────

function EstimateHero({ estimate }: { estimate: EstimateData }) {
  const totals = estimateTotals(estimate.lines);
  const customerTotal = totals.customerLabor + totals.customerMaterial;
  if (customerTotal === 0) return null;
  return (
    <div className="summary-total-hero" style={{ marginBottom: 20 }}>
      <div>
        <div className="summary-total-label">Estimated Customer Total</div>
        <div className="summary-total-amount">{formatCurrency(customerTotal)}</div>
      </div>
      <div style={{ textAlign: 'right', fontSize: 13, color: 'var(--text-muted)' }}>
        <div>Labor: {formatCurrency(totals.customerLabor)}</div>
        <div>Materials: {formatCurrency(totals.customerMaterial)}</div>
        <div style={{ marginTop: 4, color: 'var(--text-secondary)' }}>
          {estimate.lines.length} line items · {estimate.defaultTier} tier
          {estimate.isLocked && ' · Locked'}
        </div>
      </div>
    </div>
  );
}

function CustomerInfoSection({ client, assessmentId }: { client: any; assessmentId: string }) {
  const editBtn = (
    <Link to={`/assessment/${assessmentId}/client`} className="btn btn-ghost btn-sm">Edit</Link>
  );
  const clientName = [client.firstName, client.lastName].filter(Boolean).join(' ') || 'Untitled';
  return (
    <SectionCard title="Customer Info" action={editBtn}>
      <Row label="Name" value={clientName} />
      <Row label="Address" value={client.address} />
      <Row label="Phone" value={client.phone} />
      <Row label="Email" value={client.email} />
      <Row label="Visit Date" value={client.visitDate ? formatDate(client.visitDate) : undefined} />
      <Row label="Team Member" value={client.teamMember} />
      <Row label="Notes" value={client.notes} />
    </SectionCard>
  );
}

// ── Kitchen Components ─────────────────────────────────────────────────────

function WallSummary({ wallKey, wall }: { wallKey: string; wall: WallData }) {
  const wins = (wall.windows || []).filter(w => w.insideWidth || w.insideHeight || w.withTrimWidth || w.withTrimHeight);
  const winsReplacing = (wall.windows || []).filter(w => w.replacing);
  const doors = (wall.doors || []).filter(d => d.insideWidth || d.insideHeight || d.withTrimWidth || d.withTrimHeight);
  const apps = (wall.appliances || []).filter(a => a.name);
  return (
    <div className="wall-summary-block">
      <div className="summary-sub-head">Wall {wallKey}{wall.name ? ` — ${wall.name}` : ''}</div>
      <Row label="Length" value={wall.length} />
      {wall.hasUpperCabs && (
        <>
          <Row label="Upper Cabs" value="Yes" />
          <Row label="Upper H" value={wall.upperCabH} />
          <Row label="Upper D" value={wall.upperCabD} />
        </>
      )}
      {wall.hasBaseCabs && <Row label="Base Cabs" value="Yes" />}
      {wall.hasTallCab && (
        <>
          <Row label="Tall Cabinet" value="Yes" />
          <Row label="Tall H" value={wall.tallCabH} />
          <Row label="Tall D" value={wall.tallCabD} />
        </>
      )}
      {wall.hasSink && (
        <>
          <Row label="Sink" value="Yes" />
          <Row label="Sink W" value={wall.sinkW} />
          <Row label="Sink D" value={wall.sinkD} />
          <Row label="Disposal" value={wall.disposal} />
        </>
      )}
      {wins.length > 0 && <Row label="Windows" value={String(wins.length)} />}
      {winsReplacing.length > 0 && <Row label="Windows Being Replaced" value={String(winsReplacing.length)} />}
      {doors.length > 0 && <Row label="Doors/Openings" value={String(doors.length)} />}
      {apps.length > 0 && <Row label="Appliances" value={apps.map(a => a.name).join(', ')} />}
      <Row label="Cabinet Notes" value={wall.cabinetNotes} />
    </div>
  );
}

function KitchenMeasurementsSection({ m, assessmentId }: { m: KitchenMeasurements; assessmentId: string }) {
  const editBtn = (
    <Link to={`/assessment/${assessmentId}`} className="btn btn-ghost btn-sm">Edit</Link>
  );
  const populatedWalls = (m.walls || []).map((w, i) => ({ w, i })).filter(({ w }) => w.length);
  return (
    <SectionCard title="Measurements" action={editBtn}>
      <Row label="Ceiling Height" value={m.ceilingHeight} />
      {m.hasSoffit && (
        <>
          <Row label="Soffit Height" value={m.soffitH} />
          <Row label="Soffit Depth" value={m.soffitD} />
          <Row label="Soffit Width" value={m.soffitW} />
        </>
      )}
      {populatedWalls.map(({ w, i }) => (
        <WallSummary key={i} wallKey={wallLabel(i)} wall={w} />
      ))}
      {m.hasIsland && (
        <>
          <div className="summary-sub-head">Island</div>
          <Row label="Length" value={m.iLen} />
          <Row label="Width" value={m.iW} />
          <Row label="Cabinet Length" value={m.iCabLen} />
          <Row label="Status" value={m.iStatus} />
          <Row label="Sink" value={m.iSink ? 'Yes' : undefined} />
          <Row label="Cooktop" value={m.iCooktop ? 'Yes' : undefined} />
          <Row label="Outlets" value={m.iOutlet ? 'Yes' : undefined} />
          <Row label="Levels" value={m.iHasLevels ? 'Yes' : undefined} />
        </>
      )}
    </SectionCard>
  );
}

function KitchenQuestionsSection({ q, assessmentId }: { q: KitchenQuestions; assessmentId: string }) {
  const editBtn = (
    <Link to={`/assessment/${assessmentId}`} className="btn btn-ghost btn-sm">Edit</Link>
  );
  return (
    <SectionCard title="Questions" action={editBtn}>
      <Row label="Scope" value={q.scope?.join(', ')} />
      <Row label="Reason" value={q.reason?.join(', ')} />
      <Row label="Other Reason" value={q.reasonOther} />
      <Row label="Timeline" value={q.timeline} />
      <Row label="Target Date" value={q.targetDate} />
      <Row label="Cabinets" value={q.cabinets?.join(', ')} />
      <Row label="Cabinet Style" value={q.cabinetStyle} />
      <Row label="Cabinet Notes" value={q.cabinetNotes} />
      <Row label="Countertop Notes" value={q.countertopNotes} />
      <Row label="Backsplash Needed" value={q.backsplashInstall} />
      <Row label="Backsplash Material" value={q.backsplashMaterial} />
      <Row label="Backsplash Other" value={q.backsplashOther} />
      <Row label="Backsplash Notes" value={q.backsplashNotes} />
      <Row label="Recessed Lights" value={q.recessedLights ? `Yes (${q.recessedLightsCount || 'quantity not specified'})` : undefined} />
      <Row label="Sink Notes" value={q.sinkNotes} />
      <Row label="Faucet Notes" value={q.faucetNotes} />
      <Row label="Appliance Scope" value={q.applianceScope?.join(', ')} />
      <Row label="Appliances Replacing" value={q.applianceList?.join(', ')} />
      <Row label="Electrical" value={q.electrical} />
      <Row label="Plumbing" value={q.plumbing} />
      <Row label="Permits Required" value={q.permits} />
      <Row label="Referral" value={q.referral} />
      <Row label="Referral Name" value={q.referralName} />
      <Row label="Other Referral" value={q.referralOther} />
      <Row label="Special Notes" value={q.specialNoteItems?.join(', ')} />
      <Row label="Special Notes Details" value={q.specialNotes} />
    </SectionCard>
  );
}

function KitchenPhotosSection({ p, assessmentId }: { p: KitchenPhotos; assessmentId: string }) {
  const editBtn = (
    <Link to={`/assessment/${assessmentId}`} className="btn btn-ghost btn-sm">Edit</Link>
  );
  const photos = p.photos || [];
  return (
    <SectionCard
      title="Photos"
      subtitle={`${photos.length} captured`}
      action={editBtn}
    >
      <div className="photo-checklist">
        {photos.map(photo => (
          <PhotoItem key={photo.id} label={photo.label} photoId={photo.photoId} />
        ))}
      </div>
    </SectionCard>
  );
}

// ── Bathroom Components ───────────────────────────────────────────────────

function BathroomMeasurementsSection({ m, assessmentId }: { m: BathroomMeasurements; assessmentId: string }) {
  const editBtn = (
    <Link to={`/assessment/${assessmentId}`} className="btn btn-ghost btn-sm">Edit</Link>
  );
  const populatedWalls = (m.walls || []).map((w, i) => ({ w, i })).filter(({ w }) => w.length);
  return (
    <SectionCard title="Measurements" action={editBtn}>
      <Row label="Ceiling Height" value={m.ceilingHeight} />
      {m.hasSoffit && (
        <>
          <Row label="Soffit Height" value={m.soffitH} />
          <Row label="Soffit Depth" value={m.soffitD} />
          <Row label="Soffit Width" value={m.soffitW} />
        </>
      )}
      {populatedWalls.map(({ w, i }) => (
        <WallSummary key={i} wallKey={wallLabel(i)} wall={w} />
      ))}
      {m.hasTub && (
        <>
          <div className="summary-sub-head">Tub</div>
          <Row label="Length" value={m.tubLen} />
          <Row label="Width" value={m.tubW} />
          <Row label="Height" value={m.tubH} />
          <Row label="Location" value={m.tubLoc} />
          <Row label="Combined Tub/Shower" value={m.tubCombined} />
        </>
      )}
      {m.hasShower && (
        <>
          <div className="summary-sub-head">Shower</div>
          <Row label="Length" value={m.showerLen} />
          <Row label="Width" value={m.showerW} />
          <Row label="Height" value={m.showerH} />
          <Row label="Location" value={m.showerLoc} />
          <Row label="Ceiling Height" value={m.showerCeilH} />
          <Row label="Door Width" value={m.showerDoorW} />
          <Row label="Knee Wall Height" value={m.kneeWallH} />
          <Row label="Knee Wall Length" value={m.kneeWallLen} />
        </>
      )}
      <div className="summary-sub-head">Vanity</div>
      <Row label="Wall" value={m.vanityWall} />
      <Row label="Location" value={m.vanityLoc} />
      <Row label="Width" value={m.vanityW} />
      <Row label="Height" value={m.vanityH} />
      <Row label="Depth" value={m.vanityD} />
      <Row label="Single or Double" value={m.vanitySinks} />
      <Row label="Mirror Width" value={m.mirrorW} />
      <Row label="Mirror Height" value={m.mirrorH} />
      <div className="summary-sub-head">Toilet</div>
      <Row label="Location" value={m.toiletLoc} />
      <Row label="Clearance Left" value={m.toiletClearLeft} />
      <Row label="Clearance Right" value={m.toiletClearRight} />
      {m.hasLinenCloset && (
        <>
          <div className="summary-sub-head">Linen Closet</div>
          <Row label="Width" value={m.lcW} />
          <Row label="Height" value={m.lcH} />
          <Row label="Depth" value={m.lcD} />
          <Row label="Location" value={m.lcLoc} />
        </>
      )}
      <div className="summary-sub-head">Extras</div>
      <Row label="Exhaust Fan Location" value={m.exhaustFanLoc} />
      <Row label="Towel Bar Locations" value={m.towelBarLocs} />
      <Row label="Heated Floor" value={m.heatedFloor} />
      {m.hasLaundry && (
        <>
          <Row label="Washer Location" value={m.washerLoc} />
          <Row label="Washer Width" value={m.washerW} />
          <Row label="Washer Height" value={m.washerH} />
          <Row label="Dryer Location" value={m.dryerLoc} />
          <Row label="Dryer Width" value={m.dryerW} />
          <Row label="Dryer Height" value={m.dryerH} />
        </>
      )}
    </SectionCard>
  );
}

function BathroomQuestionsSection({ q, assessmentId }: { q: BathroomQuestions; assessmentId: string }) {
  const editBtn = (
    <Link to={`/assessment/${assessmentId}`} className="btn btn-ghost btn-sm">Edit</Link>
  );
  return (
    <SectionCard title="Questions" action={editBtn}>
      <Row label="Scope" value={q.scope?.join(', ')} />
      <Row label="Timeline" value={q.timeline} />
      <Row label="Target Date" value={q.targetDate} />
      <Row label="Tub/Shower Scope" value={q.tubShowerScope?.join(', ')} />
      <Row label="Vanity Scope" value={q.vanityScope?.join(', ')} />
      <Row label="Tile Scope" value={q.tileScope?.join(', ')} />
      <Row label="Grout Notes" value={q.groutNotes} />
      <Row label="Tile Pattern Notes" value={q.tilePatternNotes} />
      <Row label="Recessed Lights" value={q.recessedLights ? `Yes (${q.recessedLightsCount || 'quantity not specified'})` : undefined} />
      <Row label="Electrical" value={q.electrical} />
      <Row label="Plumbing" value={q.plumbing} />
      <Row label="Permits Required" value={q.permits} />
      <Row label="Referral" value={q.referral} />
      <Row label="Referral Name" value={q.referralName} />
      <Row label="Other Referral" value={q.referralOther} />
      <Row label="Special Notes" value={q.specialNoteItems?.join(', ')} />
      <Row label="Special Notes Details" value={q.specialNotes} />
    </SectionCard>
  );
}

function BathroomPhotosSection({ p, assessmentId }: { p: BathroomPhotos; assessmentId: string }) {
  const editBtn = (
    <Link to={`/assessment/${assessmentId}`} className="btn btn-ghost btn-sm">Edit</Link>
  );
  const photos = p.photos || [];
  return (
    <SectionCard
      title="Photos"
      subtitle={`${photos.length} captured`}
      action={editBtn}
    >
      <div className="photo-checklist">
        {photos.map(photo => (
          <PhotoItem key={photo.id} label={photo.label} photoId={photo.photoId} />
        ))}
      </div>
    </SectionCard>
  );
}

// ── Flooring Components ───────────────────────────────────────────────────

function FlooringMeasurementsSection({ m, assessmentId }: { m: FlooringMeasurements; assessmentId: string }) {
  const editBtn = (
    <Link to={`/assessment/${assessmentId}`} className="btn btn-ghost btn-sm">Edit</Link>
  );
  const grandTotal = m.rooms.reduce((sum, room) => {
    const roomTotal = (room.parts || []).reduce((s, part) => {
      const l = parseFloat(part.length || '0') || 0;
      const w = parseFloat(part.width || '0') || 0;
      return s + (l * w);
    }, 0);
    return sum + roomTotal;
  }, 0);

  return (
    <SectionCard title="Measurements" action={editBtn}>
      {m.rooms.length === 0 && (
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No rooms added.</p>
      )}
      {m.rooms.map(room => {
        const parts = room.parts || [];
        const roomTotal = parts.reduce((sum, part) => {
          const l = parseFloat(part.length || '0') || 0;
          const w = parseFloat(part.width || '0') || 0;
          return sum + (l * w);
        }, 0);
        return (
          <div key={room.id} className="wall-summary-block">
            <div className="summary-sub-head">{room.label || 'Room'}</div>
            {parts.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginLeft: 8 }}>No sections added</p>
            ) : (
              <>
                {parts.map((part, idx) => {
                  const partSqFt = (parseFloat(part.length || '0') || 0) * (parseFloat(part.width || '0') || 0);
                  return (
                    <div key={part.id} style={{ marginBottom: 8, paddingLeft: 8, borderLeft: '2px solid var(--border)' }}>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{part.label || `Section ${idx + 1}`}</div>
                      <Row label="Length" value={part.length} />
                      <Row label="Width" value={part.width} />
                      {partSqFt > 0 && <Row label="Sq Ft" value={partSqFt.toFixed(1)} />}
                    </div>
                  );
                })}
                {roomTotal > 0 && (
                  <div style={{ padding: '8px', backgroundColor: 'rgba(245,196,42,0.1)', borderRadius: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 500 }}>Room Total: </span>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{roomTotal.toFixed(1)} sq ft</span>
                  </div>
                )}
              </>
            )}
            {(room.transitions || []).length > 0 && (
              <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 6 }}>Transition Strips</div>
                {room.transitions.map((trans, tIdx) => (
                  <div key={trans.id} style={{ marginBottom: 6, paddingLeft: 8, fontSize: 13 }}>
                    <div style={{ color: 'var(--text-muted)' }}>
                      {trans.location || `Transition ${tIdx + 1}`}
                    </div>
                    {trans.length && <Row label="Length" value={trans.length} />}
                    {trans.type && <Row label="Type" value={trans.type} />}
                  </div>
                ))}
              </div>
            )}
            {(room.trims || []).length > 0 && (
              <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 6 }}>Trim Measurements</div>
                {room.trims.map((trim, tIdx) => (
                  <div key={trim.id} style={{ marginBottom: 6, paddingLeft: 8, fontSize: 13 }}>
                    <div style={{ color: 'var(--text-muted)' }}>
                      {trim.label || `Trim ${tIdx + 1}`}
                    </div>
                    {trim.length && <Row label="Length" value={trim.length} />}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
      {m.rooms.length > 0 && grandTotal > 0 && (
        <div className="summary-row" style={{ borderTop: '2px solid var(--border)', paddingTop: 12, marginTop: 8 }}>
          <span className="summary-label">Grand Total</span>
          <span className="summary-value" style={{ fontWeight: 700 }}>{grandTotal.toFixed(1)} sq ft</span>
        </div>
      )}
    </SectionCard>
  );
}

function FlooringQuestionsSection({ q, assessmentId }: { q: FlooringQuestions; assessmentId: string }) {
  const editBtn = (
    <Link to={`/assessment/${assessmentId}`} className="btn btn-ghost btn-sm">Edit</Link>
  );
  return (
    <SectionCard title="Questions" action={editBtn}>
      <Row label="Material" value={q.material?.join(', ')} />
      <Row label="Remove Existing" value={q.removeExisting} />
      <Row label="Subfloor Repairs" value={q.subfloorRepairs} />
      <Row label="Underlayment" value={q.underlayment} />
      <Row label="Stair Nosing" value={q.stairNosing} />
      <Row label="Matching Other" value={q.matchingOther} />
      <Row label="Timeline" value={q.timeline} />
      <Row label="Target Date" value={q.targetDate} />
      <Row label="Referral" value={q.referral} />
      <Row label="Referral Name" value={q.referralName} />
      <Row label="Other Referral" value={q.referralOther} />
      <Row label="Special Notes" value={q.specialNoteItems?.join(', ')} />
      <Row label="Special Notes Details" value={q.specialNotes} />
    </SectionCard>
  );
}

function FlooringPhotosSection({ p, assessmentId }: { p: FlooringPhotos; assessmentId: string }) {
  const editBtn = (
    <Link to={`/assessment/${assessmentId}`} className="btn btn-ghost btn-sm">Edit</Link>
  );
  const photos = p.photos || [];
  return (
    <SectionCard
      title="Photos"
      subtitle={`${photos.length} captured`}
      action={editBtn}
    >
      <div className="photo-checklist">
        {photos.map(photo => (
          <PhotoItem key={photo.id} label={photo.label} photoId={photo.photoId} />
        ))}
      </div>
    </SectionCard>
  );
}

// ── Living Room Components ────────────────────────────────────────────────

function LivingRoomMeasurementsSection({ m, assessmentId }: { m: LivingRoomMeasurements; assessmentId: string }) {
  const editBtn = (
    <Link to={`/assessment/${assessmentId}`} className="btn btn-ghost btn-sm">Edit</Link>
  );
  return (
    <SectionCard title="Measurements" action={editBtn}>
      <Row label="Ceiling Height" value={m.ceilingHeight} />
      <Row label="Windows" value={m.windowCount} />
      <Row label="Doors" value={m.doorCount} />
      <Row label="Outlets" value={m.outletCount} />
      <Row label="Flooring Type" value={m.flooring} />
      <Row label="Lighting Notes" value={m.lightingNotes} />
    </SectionCard>
  );
}

function LivingRoomQuestionsSection({ q, assessmentId }: { q: LivingRoomQuestions; assessmentId: string }) {
  const editBtn = (
    <Link to={`/assessment/${assessmentId}`} className="btn btn-ghost btn-sm">Edit</Link>
  );
  return (
    <SectionCard title="Questions" action={editBtn}>
      <Row label="Renovation Scope" value={q.renovationScope?.join(', ')} />
      <Row label="Timeline" value={q.timeline} />
      <Row label="Target Date" value={q.targetDate} />
      <Row label="Flooring Included" value={q.floringIncluded} />
      <Row label="Lighting Work" value={q.lightingWork} />
      <Row label="Referral" value={q.referral} />
      <Row label="Referral Name" value={q.referralName} />
      <Row label="Other Referral" value={q.referralOther} />
      <Row label="Special Notes" value={q.specialNoteItems?.join(', ')} />
      <Row label="Special Notes Details" value={q.specialNotes} />
    </SectionCard>
  );
}

function LivingRoomPhotosSection({ p, assessmentId }: { p: LivingRoomPhotos; assessmentId: string }) {
  const editBtn = (
    <Link to={`/assessment/${assessmentId}`} className="btn btn-ghost btn-sm">Edit</Link>
  );
  const photos = p.photos || [];
  return (
    <SectionCard
      title="Photos"
      subtitle={`${photos.length} captured`}
      action={editBtn}
    >
      <div className="photo-checklist">
        {photos.map(photo => (
          <PhotoItem key={photo.id} label={photo.label} photoId={photo.photoId} />
        ))}
      </div>
    </SectionCard>
  );
}

// ── Bedroom Components ────────────────────────────────────────────────────

function BedroomMeasurementsSection({ m, assessmentId }: { m: BedroomMeasurements; assessmentId: string }) {
  const editBtn = (
    <Link to={`/assessment/${assessmentId}`} className="btn btn-ghost btn-sm">Edit</Link>
  );
  return (
    <SectionCard title="Measurements" action={editBtn}>
      <Row label="Ceiling Height" value={m.ceilingHeight} />
      <Row label="Closets" value={m.closetCount} />
      <Row label="Closet Notes" value={m.closetNotes} />
      <Row label="Windows" value={m.windowCount} />
      <Row label="Doors" value={m.doorCount} />
      <Row label="Outlets" value={m.outletCount} />
      <Row label="Flooring Type" value={m.flooring} />
    </SectionCard>
  );
}

function BedroomQuestionsSection({ q, assessmentId }: { q: BedroomQuestions; assessmentId: string }) {
  const editBtn = (
    <Link to={`/assessment/${assessmentId}`} className="btn btn-ghost btn-sm">Edit</Link>
  );
  return (
    <SectionCard title="Questions" action={editBtn}>
      <Row label="Renovation Scope" value={q.renovationScope?.join(', ')} />
      <Row label="Timeline" value={q.timeline} />
      <Row label="Target Date" value={q.targetDate} />
      <Row label="Flooring Included" value={q.floringIncluded} />
      <Row label="Closet Work" value={q.closetWork} />
      <Row label="Referral" value={q.referral} />
      <Row label="Referral Name" value={q.referralName} />
      <Row label="Other Referral" value={q.referralOther} />
      <Row label="Special Notes" value={q.specialNoteItems?.join(', ')} />
      <Row label="Special Notes Details" value={q.specialNotes} />
    </SectionCard>
  );
}

function BedroomPhotosSection({ p, assessmentId }: { p: BedroomPhotos; assessmentId: string }) {
  const editBtn = (
    <Link to={`/assessment/${assessmentId}`} className="btn btn-ghost btn-sm">Edit</Link>
  );
  const photos = p.photos || [];
  return (
    <SectionCard
      title="Photos"
      subtitle={`${photos.length} captured`}
      action={editBtn}
    >
      <div className="photo-checklist">
        {photos.map(photo => (
          <PhotoItem key={photo.id} label={photo.label} photoId={photo.photoId} />
        ))}
      </div>
    </SectionCard>
  );
}

// ── Deck Components ──────────────────────────────────────────────────────

function DeckMeasurementsSection({ m, assessmentId }: { m: DeckMeasurements; assessmentId: string }) {
  const editBtn = (
    <Link to={`/assessment/${assessmentId}`} className="btn btn-ghost btn-sm">Edit</Link>
  );
  return (
    <SectionCard title="Measurements" action={editBtn}>
      <Row label="Length" value={m.length} />
      <Row label="Width" value={m.width} />
      <Row label="Height / Elevation" value={m.height} />
      {m.length && m.width && (
        <Row label="Square Feet" value={(parseFloat(m.length) * parseFloat(m.width)).toFixed(1)} />
      )}
      <Row label="Existing Condition" value={m.existingCondition} />
      <Row label="Railing Present" value={m.railingPresent} />
      {m.railingPresent && <Row label="Railing Details" value={m.railingNotes} />}
      <Row label="Access Notes" value={m.accessNotes} />
    </SectionCard>
  );
}

function DeckQuestionsSection({ q, assessmentId }: { q: DeckQuestions; assessmentId: string }) {
  const editBtn = (
    <Link to={`/assessment/${assessmentId}`} className="btn btn-ghost btn-sm">Edit</Link>
  );
  return (
    <SectionCard title="Questions" action={editBtn}>
      <Row label="Renovation Scope" value={q.renovationScope?.join(', ')} />
      <Row label="Timeline" value={q.timeline} />
      <Row label="Target Date" value={q.targetDate} />
      <Row label="Existing Condition" value={q.existing} />
      <Row label="Railing" value={q.railing} />
      <Row label="Referral" value={q.referral} />
      <Row label="Referral Name" value={q.referralName} />
      <Row label="Other Referral" value={q.referralOther} />
      <Row label="Special Notes" value={q.specialNoteItems?.join(', ')} />
      <Row label="Special Notes Details" value={q.specialNotes} />
    </SectionCard>
  );
}

function DeckPhotosSection({ p, assessmentId }: { p: DeckPhotos; assessmentId: string }) {
  const editBtn = (
    <Link to={`/assessment/${assessmentId}`} className="btn btn-ghost btn-sm">Edit</Link>
  );
  const photos = p.photos || [];
  return (
    <SectionCard
      title="Photos"
      subtitle={`${photos.length} captured`}
      action={editBtn}
    >
      <div className="photo-checklist">
        {photos.map(photo => (
          <PhotoItem key={photo.id} label={photo.label} photoId={photo.photoId} />
        ))}
      </div>
    </SectionCard>
  );
}

// ── Other Section ─────────────────────────────────────────────────────────

function OtherSection({ other, assessmentId }: { other: OtherAssessment; assessmentId: string }) {
  const editBtn = (
    <Link to={`/assessment/${assessmentId}`} className="btn btn-ghost btn-sm">Edit</Link>
  );
  return (
    <SectionCard title="Custom Job Notes" action={editBtn}>
      {other.measurementNotes && (
        <>
          <div className="summary-sub-head">Measurements</div>
          <p className="general-notes-text">{other.measurementNotes}</p>
        </>
      )}
      {other.questionNotes && (
        <>
          <div className="summary-sub-head">Questions</div>
          <p className="general-notes-text">{other.questionNotes}</p>
        </>
      )}
      {other.photoNotes && (
        <>
          <div className="summary-sub-head">Photos</div>
          <p className="general-notes-text">{other.photoNotes}</p>
        </>
      )}
      {!other.measurementNotes && !other.questionNotes && !other.photoNotes && (
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No notes added.</p>
      )}
    </SectionCard>
  );
}

// ── Job Section Dispatcher ────────────────────────────────────────────────

function JobSection({ job, assessmentId }: { job: JobInstance; assessmentId: string }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div className="job-section-divider">
        <span className="job-section-label">{job.label} — {job.type}</span>
      </div>
      {job.type === 'Kitchen' && (
        <>
          <KitchenMeasurementsSection m={job.kitchen.measurements} assessmentId={assessmentId} />
          <KitchenQuestionsSection q={job.kitchen.questions} assessmentId={assessmentId} />
          <KitchenPhotosSection p={job.kitchen.photos} assessmentId={assessmentId} />
        </>
      )}
      {job.type === 'Bathroom' && job.bathroom && (
        <>
          <BathroomMeasurementsSection m={job.bathroom.measurements} assessmentId={assessmentId} />
          <BathroomQuestionsSection q={job.bathroom.questions} assessmentId={assessmentId} />
          <BathroomPhotosSection p={job.bathroom.photos} assessmentId={assessmentId} />
        </>
      )}
      {job.type === 'Flooring' && job.flooring && (
        <>
          <FlooringMeasurementsSection m={job.flooring.measurements} assessmentId={assessmentId} />
          <FlooringQuestionsSection q={job.flooring.questions} assessmentId={assessmentId} />
          <FlooringPhotosSection p={job.flooring.photos} assessmentId={assessmentId} />
        </>
      )}
      {job.type === 'Living Room' && job.livingRoom && (
        <>
          <LivingRoomMeasurementsSection m={job.livingRoom.measurements} assessmentId={assessmentId} />
          <LivingRoomQuestionsSection q={job.livingRoom.questions} assessmentId={assessmentId} />
          <LivingRoomPhotosSection p={job.livingRoom.photos} assessmentId={assessmentId} />
        </>
      )}
      {job.type === 'Bedroom' && job.bedroom && (
        <>
          <BedroomMeasurementsSection m={job.bedroom.measurements} assessmentId={assessmentId} />
          <BedroomQuestionsSection q={job.bedroom.questions} assessmentId={assessmentId} />
          <BedroomPhotosSection p={job.bedroom.photos} assessmentId={assessmentId} />
        </>
      )}
      {job.type === 'Deck' && job.deck && (
        <>
          <DeckMeasurementsSection m={job.deck.measurements} assessmentId={assessmentId} />
          <DeckQuestionsSection q={job.deck.questions} assessmentId={assessmentId} />
          <DeckPhotosSection p={job.deck.photos} assessmentId={assessmentId} />
        </>
      )}
      {job.type === 'Other' && job.other && (
        <OtherSection other={job.other} assessmentId={assessmentId} />
      )}
      {job.layout?.canvasData && (
        <SectionCard title="📐 Room Layout">
          <img
            src={job.layout.canvasData}
            alt="Room layout sketch"
            style={{ width: '100%', borderRadius: 8, border: '1px solid var(--border)' }}
          />
        </SectionCard>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────

export default function SummaryView() {
  const { id } = useParams<{ id: string }>();
  const { getAssessment } = useAssessmentStore();
  const assessment = id ? getAssessment(id) : undefined;

  if (!assessment) {
    return (
      <div className="page">
        <div className="empty-state">
          <h2>Assessment not found</h2>
          <Link to="/" className="btn btn-primary">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const { client, jobs, estimate, generalNotes } = assessment;
  const clientName = [client.firstName, client.lastName].filter(Boolean).join(' ') || 'Untitled';

  return (
    <div className="page">
      <div className="breadcrumb-row">
        <Link to="/" className="breadcrumb-link">Dashboard</Link>
        <span className="breadcrumb-sep">/</span>
        <Link to={`/assessment/${id}`} className="breadcrumb-link">{clientName}</Link>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">Summary</span>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title">Summary — {clientName}</h1>
          {client.address && <p className="page-subtitle">{client.address}</p>}
          <p className="page-subtitle">
            Visit {formatDate(client.visitDate)} · Updated {formatDate(assessment.updatedAt)}
          </p>
        </div>
        <StatusBadge status={assessment.status} />
      </div>

      {estimate && <EstimateHero estimate={estimate} />}

      <CustomerInfoSection client={client} assessmentId={id!} />

      {jobs.length === 0 && (
        <div className="empty-state">
          <p>No jobs added to this assessment yet.</p>
          <Link to={`/assessment/${id}/type`} className="btn btn-primary">Add Jobs</Link>
        </div>
      )}

      {jobs.map(job => (
        <JobSection key={job.id} job={job} assessmentId={id!} />
      ))}

      {generalNotes && (
        <SectionCard title="General Notes">
          <p className="general-notes-text">{generalNotes}</p>
        </SectionCard>
      )}

      <div className="summary-actions">
        <Link to={`/assessment/${id}`} className="btn btn-ghost">Back to Assessment</Link>
        <Link to={`/assessment/${id}/estimate`} className="btn btn-outline">View Estimate</Link>
        <button className="btn btn-primary" onClick={() => window.print()}>Print / Save PDF</button>
      </div>
    </div>
  );
}
