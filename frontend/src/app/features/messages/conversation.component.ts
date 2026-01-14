import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService, PublicUser } from '../../core/auth.service';
import { Message } from '../../core/models';

interface OtherUser {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
}

@Component({
  selector: 'app-conversation',
  templateUrl: './conversation.component.html',
  styleUrls: ['./conversation.component.scss']
})
export class ConversationComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  
  currentUser: PublicUser | null = null;
  otherUser: OtherUser | null = null;
  otherUserId: number = 0;
  messages: Message[] = [];
  loading = true;
  sending = false;
  newMessage = '';
  private refreshInterval: any;
  private shouldScrollToBottom = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.currentUser = this.auth.getUser();
    this.otherUserId = Number(this.route.snapshot.paramMap.get('userId'));
    
    if (this.currentUser && this.otherUserId) {
      this.loadOtherUser();
      this.loadMessages();
      // Refresh messages every 10 seconds
      this.refreshInterval = setInterval(() => this.loadMessages(false), 10000);
    }
  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
    }
  }

  loadOtherUser() {
    this.api.getUserById(this.otherUserId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.otherUser = res.data;
        }
      }
    });
  }

  loadMessages(showLoading = true) {
    if (!this.currentUser) return;
    
    if (showLoading) {
      this.loading = true;
    }
    
    this.api.getConversation(this.currentUser.user_id, this.otherUserId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const hadMessages = this.messages.length;
          this.messages = res.data;
          this.shouldScrollToBottom = !hadMessages || this.messages.length > hadMessages;
          
          // Mark messages as read
          if (this.currentUser) {
            this.api.markAllMessagesAsRead(this.currentUser.user_id, this.otherUserId).subscribe();
          }
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  sendMessage() {
    if (!this.currentUser || !this.newMessage.trim()) return;
    
    this.sending = true;
    this.api.sendMessage({
      sender_id: this.currentUser.user_id,
      receiver_id: this.otherUserId,
      body: this.newMessage.trim()
    }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.messages.push(res.data);
          this.newMessage = '';
          this.shouldScrollToBottom = true;
        }
        this.sending = false;
      },
      error: () => {
        this.sending = false;
        alert('Failed to send message. Please try again.');
      }
    });
  }

  scrollToBottom() {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch (err) {}
  }

  goBack() {
    this.router.navigate(['/messages']);
  }

  getOtherUserName(): string {
    if (!this.otherUser) return 'Loading...';
    return `${this.otherUser.first_name} ${this.otherUser.last_name}`;
  }

  getOtherUserInitials(): string {
    if (!this.otherUser) return '?';
    return (this.otherUser.first_name[0] + this.otherUser.last_name[0]).toUpperCase();
  }

  isOwnMessage(msg: Message): boolean {
    return msg.sender_id === this.currentUser?.user_id;
  }

  formatMessageTime(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  formatMessageDate(dateStr: string): string {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
    }
  }

  shouldShowDateSeparator(index: number): boolean {
    if (index === 0) return true;
    
    const currentDate = new Date(this.messages[index].sent_at).toDateString();
    const prevDate = new Date(this.messages[index - 1].sent_at).toDateString();
    
    return currentDate !== prevDate;
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}
