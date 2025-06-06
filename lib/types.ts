export interface HealthCheckItem {
  checked: boolean
  value: string | number
  status?: "normal" | "warning" | "danger"
}

export interface HealthCheckFormData {
  items: {
    poop: HealthCheckItem
    pee: HealthCheckItem
    sleep: HealthCheckItem
    temperature: HealthCheckItem
    appetite: HealthCheckItem
    water: HealthCheckItem
    activity: HealthCheckItem
    mood: HealthCheckItem
    skin: HealthCheckItem
    eye: HealthCheckItem
    ear: HealthCheckItem
    nose: HealthCheckItem
    mouth: HealthCheckItem
    vomit: HealthCheckItem
    cough: HealthCheckItem
    medicine: HealthCheckItem
  }
  memo: string
}

export interface HealthCheckRecord {
  date: string
  time: string
  items: Array<{
    id: string
    value: string | number
    status: "normal" | "warning" | "danger"
  }>
}

export interface HealthActivity {
  type: "health"
  date: string
  time: string
  description: string
}

export interface HealthData {
  activities: HealthActivity[]
  healthChecks: HealthCheckRecord[]
} 