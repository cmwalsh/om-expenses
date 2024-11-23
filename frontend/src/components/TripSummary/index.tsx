import { TripSummaryInfo } from "~/lib";
import "./style.scss";

interface Props {
  tripSummary: TripSummaryInfo;
}

export function TripSummary(props: Props) {
  return (
    <div class="trip-summary grid align-items-center">
      <div class="trip-summary-left g-col-12 g-col-md-6">
        <div class="trip-summary-name">{props.tripSummary.name}</div>
        <div class="trip-summary-location">{props.tripSummary.location}</div>
      </div>

      <div class="trip-summary-right g-col-12 g-col-md-6">
        <div class="trip-summary-travellers">
          <div class="badge text-bg-success">Travelers: {props.tripSummary.user_count ?? 0}</div>
        </div>
        <div class="trip-summary-unapproved">
          <div class="badge text-bg-danger">
            Total Awaiting: {props.tripSummary.unapproved ?? 0} ({props.tripSummary.unapproved_count ?? 0})
          </div>
        </div>
        <div class="trip-summary-approved">
          <div class="badge text-bg-warning">
            Total Approved: {props.tripSummary.approved ?? 0} ({props.tripSummary.approved_count ?? 0})
          </div>
        </div>
      </div>
    </div>
  );
}
