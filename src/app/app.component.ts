import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class AppComponent {
  length = 12;
  includeLetters = true;
  includeNumbers = true;
  includeSymbols = false;
  password = '';

  copied = false;
  strengthPercent = 0;
  strengthLabel = 'Weak';

  onChangeLength(value: string) {
    const parsedValue = parseInt(value, 10);
    if (!isNaN(parsedValue)) {
      this.length = Math.max(4, Math.min(parsedValue, 64));
    }
  }

  onChangeUseLetters() {
    this.includeLetters = !this.includeLetters;
  }

  onChangeUseNumbers() {
    this.includeNumbers = !this.includeNumbers;
  }

  onChangeUseSymbols() {
    this.includeSymbols = !this.includeSymbols;
  }

  onButtonClick() {
    const numbers = '0123456789';
    const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const symbols = "!@#$%^&*()_+-=[]{}|;:',.<>/?";

    let validChars = '';
    if (this.includeLetters) {
      validChars += letters;
    }
    if (this.includeNumbers) {
      validChars += numbers;
    }
    if (this.includeSymbols) {
      validChars += symbols;
    }

    if (!validChars) {
      this.password = '';
      this.updateStrength('');
      return;
    }

    let generatedPassword = '';

    // Ensure at least one character from each selected set
    const requiredSets: string[] = [];
    if (this.includeLetters) requiredSets.push(letters);
    if (this.includeNumbers) requiredSets.push(numbers);
    if (this.includeSymbols) requiredSets.push(symbols);

    for (const set of requiredSets) {
      const index = Math.floor(Math.random() * set.length);
      generatedPassword += set[index];
    }

    for (let i = generatedPassword.length; i < this.length; i++) {
      const index = Math.floor(Math.random() * validChars.length);
      generatedPassword += validChars[index];
    }

    // Shuffle to avoid predictable first chars
    this.password = this.shuffleString(generatedPassword);
    this.updateStrength(this.password);
    this.copied = false;
  }

  copyToClipboard() {
    if (!this.password) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(this.password)
        .then(() => this.flashCopied());
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = this.password;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        this.flashCopied();
      } finally {
        document.body.removeChild(textarea);
      }
    }
  }

  getStrengthClass(): string {
    if (this.strengthPercent >= 80) return 'strong';
    if (this.strengthPercent >= 50) return 'medium';
    return 'weak';
  }

  private flashCopied() {
    this.copied = true;
    setTimeout(() => (this.copied = false), 1200);
  }

  private shuffleString(input: string): string {
    const arr = input.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
  }

  private updateStrength(pwd: string) {
    if (!pwd) {
      this.strengthPercent = 0;
      this.strengthLabel = 'Weak';
      return;
    }

    const lengthScore = Math.min(1, pwd.length / 16); // 16+ chars max score
    const hasLower = /[a-z]/.test(pwd) ? 1 : 0;
    const hasUpper = /[A-Z]/.test(pwd) ? 1 : 0;
    const hasNumber = /\d/.test(pwd) ? 1 : 0;
    const hasSymbol = /[^A-Za-z0-9]/.test(pwd) ? 1 : 0;
    const variety = (hasLower + hasUpper + hasNumber + hasSymbol) / 4;

    const score = 0.6 * lengthScore + 0.4 * variety;
    this.strengthPercent = Math.round(score * 100);

    if (this.strengthPercent >= 80) this.strengthLabel = 'Strong';
    else if (this.strengthPercent >= 50) this.strengthLabel = 'Medium';
    else this.strengthLabel = 'Weak';
  }
}
