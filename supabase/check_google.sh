docker inspect supabase-auth --format '{{range .Config.Env}}{{println .}}{{end}}' | grep -i google
