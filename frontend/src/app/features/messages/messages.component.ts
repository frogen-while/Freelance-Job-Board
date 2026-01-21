import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService, PublicUser } from '../../core/auth.service';
import { FormatService } from '../../core/format.service';
import { Message } from '../../core/models';

interface ConversationPreview {
  other_user_id: number;
  other_user_name: string;
  unread_count: number;
}

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  currentUser: PublicUser | null = null;
  conversations: ConversationPreview[] = [];
  loading = true;

  selectedUserId: number | null = null;
  selectedUser: { first_name: string; last_name: string } | null = null;
  messages: Message[] = [];
  loadingMessages = false;

  newMessage = '';
  sending = false;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private route: ActivatedRoute,
    public fmt: FormatService
  ) {}

  ngOnInit() {
    this.currentUser = this.auth.getUser();
    if (this.currentUser) {
      this.loadConversations();

      const userId = this.route.snapshot.queryParams['userId'];
      if (userId) {
        this.selectConversation(Number(userId));
      }
    }
  }

  loadConversations() {
    if (!this.currentUser) return;
    this.loading = true;

    this.api.getMessagesByUser(this.currentUser.user_id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.conversations = this.groupMessages(res.data);
          this.loadUserNames();
        }
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  groupMessages(messages: Message[]): ConversationPreview[] {
    const map = new Map<number, ConversationPreview>();

    for (const msg of messages) {
      const otherId = msg.sender_id === this.currentUser?.user_id ? msg.receiver_id : msg.sender_id;

      if (!map.has(otherId)) {
        const name = msg.sender_id === this.currentUser?.user_id
          ? (msg.receiver_name?.trim() || `User #${msg.receiver_id}`)
          : (msg.sender_name?.trim() || `User #${msg.sender_id}`);

        map.set(otherId, {
          other_user_id: otherId,
          other_user_name: name,
          unread_count: (!msg.is_read && msg.receiver_id === this.currentUser?.user_id) ? 1 : 0
        });
      } else {
        const conv = map.get(otherId)!;
        if (!msg.is_read && msg.receiver_id === this.currentUser?.user_id) {
          conv.unread_count++;
        }
      }
    }

    return Array.from(map.values());
  }

  loadUserNames() {
    for (const conv of this.conversations) {
      this.api.getUserById(conv.other_user_id).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            const user = res.data as any;
            conv.other_user_name = `${user.first_name} ${user.last_name}`.trim() || conv.other_user_name;
          }
        }
      });
    }
  }

  selectConversation(userId: number) {
    this.selectedUserId = userId;
    this.loadSelectedUser();
    this.loadMessages();
  }

  loadSelectedUser() {
    if (!this.selectedUserId) return;

    this.api.getUserById(this.selectedUserId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.selectedUser = res.data;
        }
      }
    });
  }

  loadMessages() {
    if (!this.currentUser || !this.selectedUserId) return;
    this.loadingMessages = true;

    this.api.getConversation(this.currentUser.user_id, this.selectedUserId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.messages = res.data;
          setTimeout(() => this.scrollToBottom(), 100);
        }
        this.loadingMessages = false;
      },
      error: () => this.loadingMessages = false
    });
  }

  sendMessage() {
    if (!this.currentUser || !this.selectedUserId || !this.newMessage.trim()) return;

    this.sending = true;
    this.api.sendMessage({
      sender_id: this.currentUser.user_id,
      receiver_id: this.selectedUserId,
      body: this.newMessage.trim()
    }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.messages.push(res.data);
          this.newMessage = '';
          setTimeout(() => this.scrollToBottom(), 100);
        }
        this.sending = false;
      },
      error: () => {
        this.sending = false;
        alert('Failed to send message');
      }
    });
  }

  scrollToBottom() {
    if (this.messagesContainer) {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    }
  }

  closeConversation() {
    this.selectedUserId = null;
    this.selectedUser = null;
    this.messages = [];
  }

  getSelectedUserName(): string {
    return this.selectedUser
      ? `${this.selectedUser.first_name} ${this.selectedUser.last_name}`
      : 'Loading...';
  }

  getSelectedUserInitials(): string {
    return this.selectedUser
      ? (this.selectedUser.first_name[0] + this.selectedUser.last_name[0]).toUpperCase()
      : '?';
  }

  isOwnMessage(msg: Message): boolean {
    return msg.sender_id === this.currentUser?.user_id;
  }

  formatMessageTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  formatMessageDate(dateStr: string): string {
    const date = new Date(dateStr);
    const today = new Date();

    if (date.toDateString() === today.toDateString()) return 'Today';

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }

  shouldShowDateSeparator(index: number): boolean {
    if (index === 0) return true;
    return new Date(this.messages[index].sent_at).toDateString() !==
           new Date(this.messages[index - 1].sent_at).toDateString();
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  isConversationSelected(userId: number): boolean {
    return this.selectedUserId === userId;
  }
}
