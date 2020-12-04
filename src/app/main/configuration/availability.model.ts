export class AvailabilityConfiguration {
    constructor(
        public enabled: boolean,
        public availabilityInterval: number,
        public baseLeadTime: number,
        public overflowThreshold: number,
        public overflowInterval: number,
        public overflowLeadTime: number
    ){}
}