import { useState, type FormEvent } from 'react'

interface Props {
  error?: string
  onSave: (token: string) => void
}

/** First-run screen on the tablet: paste a long-lived access token once; it's stored in this browser only. */
export function TokenSetup({ error, onSave }: Props) {
  const [value, setValue] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (value.trim()) onSave(value.trim())
  }

  return (
    <div className="setup">
      <form className="card setup-card" onSubmit={submit}>
        <h1>Connect to Home Assistant</h1>
        <p className="muted">
          Create a token in Home Assistant under <b>Profile → Security → Long-lived access tokens</b>, then paste it
          here. It is stored only in this browser.
        </p>
        {error && <p className="error">{error}</p>}
        <textarea value={value} onChange={(e) => setValue(e.target.value)} rows={5} placeholder="eyJhbGciOi…" />
        <button type="submit" className="primary">
          Connect
        </button>
      </form>
    </div>
  )
}
