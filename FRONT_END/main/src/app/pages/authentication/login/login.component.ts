  ngOnInit(): void {
    // Afficher les informations de connexion par défaut
    console.log('🔐 Informations de connexion par défaut:');
    console.log('👑 Admin: admin@gmail.com / 123456');
    console.log('👤 User: Créez un compte ou utilisez un compte existant');
    
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  } 
 
 
 