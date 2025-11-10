import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),
    provideHttpClient()
  ]
})
  .then(() => {})
  .catch((err) => {
    console.error('ERROR bootstrapping Angular:', err);
    document.body.innerHTML = `
      <div style="padding: 50px; background: #ffebee; border: 2px solid #c62828; color: #c62828;">
        <h1>Angular Bootstrap Error</h1>
        <p><strong>Error:</strong> ${err.message || 'Unknown error'}</p>
        <pre style="background: white; padding: 20px; overflow: auto;">${err.stack || err}</pre>
      </div>
    `;
  });
