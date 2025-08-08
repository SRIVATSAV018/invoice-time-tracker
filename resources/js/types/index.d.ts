import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    notification: {
        message: string;
        type: string;
    };
    [key: string]: unknown;
}

export interface PaginatedResult<T> {
    data: Array<T>;
    current_page: number;
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;

    links: Array<{
        active: boolean;
        label: string;
        url: string | null;
    }>
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    settings: UserSettings;
    [key: string]: unknown;

    time_entries?: Array<TimeEntry>;
    clients?: Array<Client>;
}

export interface UserSettings {
    logo: string;
    name: string;
    address_line1: string;
    address_line2: string;
    postal_code: string;
    city: string;
    country: string;
    email: string;
    phone: string;
    website: string;

    bank_name: string;
    account_holder: string;
    iban: string;
    bic: string;

    currency: string;
    subject_to_sales_tax: boolean;
    sales_tax: number;
    tax_number: string;

    payment_goal: number;
};

interface Timestamps {
    created_at: string;
    updated_at: string;
}

interface Deletable {
    deleted_at: string | null;
}

export interface CompanyDetails extends Timestamps {
    id: number;
    name: string;
    name: string;
    address_line1: string;
    address_line2: string;
    postal_code: string;
    city: string;
    country: string;
    email: string;
    phone: string;
    tax_number: string;
    currency: string;
    vat: string;
    bank_name: string;
    iban: string;
    bic: string;
    logo_path: string | null;
    logo_url: string | null;
}

export interface Client extends Deletable, Timestamps {
    id: number;
    uuid: string;
    company_name: string;
    contact_person: string | null;
    contact_person_gender: GenderEnum;
    contact_person_salutation: SalutationEnum;
    email: string;
    phone: string;
    address_line1: string;
    address_line2: string | null;
    postal_code: string;
    city: string;
    country: string;
    tax_number: string | null;
    notes: string | null;

    // Relationsclient_company
    projects?: Array<Project>;
    invoices?: Array<Invoice>;
    time_entries?: Array<TimeEntry>;
    user?: User;
}

export interface Project extends Deletable, Timestamps {
    id: number;
    uuid: string;
    client_id: number;
    name: string;
    description: string | null;
    hourly_rate: number;
    starts_at: string | null;
    ends_at: string | null;
    tech_stack: string | null;
    auto_generate_invoice: boolean;
    auto_generate_amount: number;
    auto_generate_unit: 'day' | 'week' | 'month';

    // Relations
    client?: Client;
    invoices?: Array<Invoice>;
    time_entries?: Array<TimeEntry>;
}

export interface Invoice extends Timestamps, Deletable {
    id: number;
    uuid: string;
    client_id: number;
    project_id: number;
    invoice_number: string;
    issued_at: string;
    due_at: string | null;
    status: InvoiceStatusEnum;
    is_pdf_generating: boolean;
    pdf_path: string | null;
    client_company: string;
    client_address_line1: string;
    client_postal_code: string;
    client_city: string;
    client_country: string;
    notes: string;
    service_period_start: string;
    service_period_end: string;
    does_pdf_exist: boolean;
    pdf_url: string | null;

    // Relations
    client?: Client;
    project?: Project | null;
    items?: Array<InvoiceItem>;
}

export interface InvoiceItem extends Timestamps {
    id: number;
    uuid: string;
    invoice_id: number;
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
}

export interface TimeEntry extends Timestamps {
    id: number;
    uuid: string;
    project_id: number;
    user_id: number;
    description: string | null;
    started_at: string;
    ended_at: string;
    duration_hours: number;

    project?: Project;
}

export interface Offer extends Timestamps, Deletable {
    id: number;
    uuid: string;
    offer_number: string | null;
    client_id: number;
    project_id: number;
    status: OfferStatusEnum;
    client_company: string;
    client_contact_person: string;
    client_contact_person_gender: GenderEnum;
    client_contact_person_salutation: SalutationEnum;
    client_street: string;
    client_postal_code: string;
    client_city: string;
    client_country: string;
    client_tax_number: string;
    project_name: string;
    project_description: string;
    notes: string | null;
    net_total: number | null;
    tax_rate: number | null;
    tax_total: number | null;
    gross_total: number | null;
    pdf_url: string | null;
    accepted_by_ip: string | null;
    valid_until: string | null;
    sent_at: string | null;
    accepted_at: string | null;
    service_period_start: string;
    service_period_end: string;

    project?: Project;
    client?: Client;
    items?: Array<OfferItem>;
}

export interface OfferItem extends Timestamps {
    id: number;
    uuid: string;
    offer_id: number;
    unit: string;
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
}

export enum InvoiceStatusEnum {
    DRAFT = 'DRAFT',
    OPEN = 'OPEN',
    UNDER_REVIEW = 'UNDER_REVIEW',
    APPROVED = 'APPROVED',
    SENT = 'SENT',
    PAID = 'PAID',
    OVERDUE = 'OVERDUE'
}

export enum OfferStatusEnum {
    DRAFT = 'DRAFT',
    SENT = 'SENT',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
    EXPIRED = 'EXPIRED'
}

export enum GenderEnum {
    MALE = 'MALE',
    FEMALE = 'FEMALE'
}

export enum SalutationEnum {
    DR = 'dr',
    PROF = 'prof',
    PROF_DR = 'prof_dr',
    DIPL_INg = 'dipl_ing'
}

export const OfferStatusLabels: Record<OfferStatusEnum, string> = {
    [OfferStatusEnum.DRAFT]: 'Entwurf',
    [OfferStatusEnum.SENT]: 'Versendet',
    [OfferStatusEnum.ACCEPTED]: 'Akzeptiert',
    [OfferStatusEnum.REJECTED]: 'Abgelehnt',
    [OfferStatusEnum.EXPIRED]: 'Abgelaufen'
}

export const SalutationLabels: Record<SalutationEnum, string> = {
    [SalutationEnum.DR]: 'Dr.',
    [SalutationEnum.PROF]: 'Prof.',
    [SalutationEnum.PROF_DR]: 'Prof. Dr.',
    [SalutationEnum.DIPL_INg]: 'Dipl.-Ing.w'
}

export const InvoiceStatusLabels: Record<InvoiceStatusEnum, string> = {
    [InvoiceStatusEnum.DRAFT]:   'Entwurf',
    [InvoiceStatusEnum.OPEN]:    'Offen',
    [InvoiceStatusEnum.UNDER_REVIEW]:    'In Prüfung',
    [InvoiceStatusEnum.APPROVED]:    'Genehmigt',
    [InvoiceStatusEnum.SENT]:    'Versendet',
    [InvoiceStatusEnum.PAID]:    'Bezahlt',
    [InvoiceStatusEnum.OVERDUE]: 'Überfällig',
};
