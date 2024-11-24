import { UserTripSummaryInfo } from "~/lib";
import "./style.scss";

interface Props {
  tripSummary: UserTripSummaryInfo;

  onClickTrip: () => void;
}

export function UserTripSummary(props: Props) {
  return (
    <div class="trip-summary grid align-items-center">
      <div class="trip-summary-left g-col-12 g-col-md-6">
        <div class="trip-summary-name" on:click={props.onClickTrip}>
          {props.tripSummary.name}
        </div>
        <div class="trip-summary-location">{props.tripSummary.location}</div>
      </div>

      <div class="trip-summary-right g-col-12 g-col-md-6">
        <div class="trip-summary-unapproved">
          <div class="badge text-bg-danger">
            Submitted: {props.tripSummary.unapproved ?? 0} ({props.tripSummary.unapproved_count ?? 0})
          </div>
        </div>
        <div class="trip-summary-approved">
          <div class="badge text-bg-warning">
            Approved: {props.tripSummary.approved ?? 0} ({props.tripSummary.approved_count ?? 0})
          </div>
        </div>
      </div>
    </div>
  );
}
