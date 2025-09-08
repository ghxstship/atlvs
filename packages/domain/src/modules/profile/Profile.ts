import { UniqueEntityID } from '../../core/UniqueEntityID';
import { Result } from '../../core/Result';

export interface UserProfileProps {
  userId: string;
  organizationId: string;
  avatarUrl?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
  nationality?: string;
  languages: string[];
  phonePrimary?: string;
  phoneSecondary?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  stateProvince?: string;
  postalCode?: string;
  country?: string;
  jobTitle?: string;
  department?: string;
  employeeId?: string;
  hireDate?: Date;
  employmentType?: 'full-time' | 'part-time' | 'contract' | 'freelance' | 'intern';
  managerId?: string;
  skills: string[];
  bio?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  profileCompletionPercentage: number;
  lastUpdatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class UserProfile {
  private constructor(
    private props: UserProfileProps,
    private _id: UniqueEntityID
  ) {}

  public static create(props: Omit<UserProfileProps, 'createdAt' | 'updatedAt' | 'profileCompletionPercentage'>, id?: UniqueEntityID): Result<UserProfile> {
    const profileProps: UserProfileProps = {
      ...props,
      languages: props.languages || [],
      skills: props.skills || [],
      status: props.status || 'active',
      profileCompletionPercentage: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const profile = new UserProfile(profileProps, id || new UniqueEntityID());
    profile.calculateCompletionPercentage();
    
    return Result.ok(profile);
  }

  get id(): UniqueEntityID {
    return this._id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get organizationId(): string {
    return this.props.organizationId;
  }

  get fullContactInfo(): string {
    const parts = [
      this.props.phonePrimary,
      this.props.city,
      this.props.country
    ].filter(Boolean);
    return parts.join(', ');
  }

  get isProfileComplete(): boolean {
    return this.props.profileCompletionPercentage >= 80;
  }

  public updateBasicInfo(info: Partial<Pick<UserProfileProps, 'avatarUrl' | 'dateOfBirth' | 'gender' | 'nationality' | 'languages'>>): void {
    Object.assign(this.props, info);
    this.props.updatedAt = new Date();
    this.calculateCompletionPercentage();
  }

  public updateContactInfo(contact: Partial<Pick<UserProfileProps, 'phonePrimary' | 'phoneSecondary' | 'addressLine1' | 'addressLine2' | 'city' | 'stateProvince' | 'postalCode' | 'country'>>): void {
    Object.assign(this.props, contact);
    this.props.updatedAt = new Date();
    this.calculateCompletionPercentage();
  }

  public updateProfessionalInfo(professional: Partial<Pick<UserProfileProps, 'jobTitle' | 'department' | 'employeeId' | 'hireDate' | 'employmentType' | 'managerId' | 'skills' | 'bio' | 'linkedinUrl' | 'websiteUrl'>>): void {
    Object.assign(this.props, professional);
    this.props.updatedAt = new Date();
    this.calculateCompletionPercentage();
  }

  public updateStatus(status: UserProfileProps['status'], updatedBy: string): void {
    this.props.status = status;
    this.props.lastUpdatedBy = updatedBy;
    this.props.updatedAt = new Date();
  }

  private calculateCompletionPercentage(): void {
    const requiredFields = [
      'avatarUrl', 'dateOfBirth', 'phonePrimary', 'addressLine1', 'city', 'country',
      'jobTitle', 'department', 'hireDate', 'employmentType', 'bio'
    ];
    
    const completedFields = requiredFields.filter(field => {
      const value = this.props[field as keyof UserProfileProps];
      return value !== null && value !== undefined && value !== '';
    });

    const arrayFields = ['languages', 'skills'];
    const completedArrayFields = arrayFields.filter(field => {
      const value = this.props[field as keyof UserProfileProps] as string[];
      return value && value.length > 0;
    });

    const totalFields = requiredFields.length + arrayFields.length;
    const completedTotal = completedFields.length + completedArrayFields.length;
    
    this.props.profileCompletionPercentage = Math.round((completedTotal / totalFields) * 100);
  }

  public toJSON(): UserProfileProps & { id: string } {
    return {
      id: this._id.toString(),
      ...this.props
    };
  }
}

export interface CertificationProps {
  userId: string;
  organizationId: string;
  name: string;
  issuingOrganization: string;
  certificationNumber?: string;
  issueDate?: Date;
  expiryDate?: Date;
  status: 'active' | 'expired' | 'suspended' | 'revoked';
  verificationUrl?: string;
  attachmentUrl?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Certification {
  private constructor(
    private props: CertificationProps,
    private _id: UniqueEntityID
  ) {}

  public static create(props: Omit<CertificationProps, 'createdAt' | 'updatedAt'>, id?: UniqueEntityID): Result<Certification> {
    const certificationProps: CertificationProps = {
      ...props,
      status: props.status || 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return Result.ok(new Certification(certificationProps, id || new UniqueEntityID()));
  }

  get id(): UniqueEntityID {
    return this._id;
  }

  get isExpired(): boolean {
    if (!this.props.expiryDate) return false;
    return this.props.expiryDate < new Date();
  }

  get isExpiringSoon(): boolean {
    if (!this.props.expiryDate) return false;
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return this.props.expiryDate <= thirtyDaysFromNow && this.props.expiryDate > new Date();
  }

  public updateStatus(status: CertificationProps['status']): void {
    this.props.status = status;
    this.props.updatedAt = new Date();
  }

  public renew(newExpiryDate: Date, newCertificationNumber?: string): void {
    this.props.expiryDate = newExpiryDate;
    if (newCertificationNumber) {
      this.props.certificationNumber = newCertificationNumber;
    }
    this.props.status = 'active';
    this.props.updatedAt = new Date();
  }

  public toJSON(): CertificationProps & { id: string } {
    return {
      id: this._id.toString(),
      ...this.props
    };
  }
}

export interface JobHistoryProps {
  userId: string;
  organizationId: string;
  companyName: string;
  jobTitle: string;
  department?: string;
  employmentType: 'full-time' | 'part-time' | 'contract' | 'freelance' | 'intern';
  startDate: Date;
  endDate?: Date;
  isCurrent: boolean;
  location?: string;
  description?: string;
  achievements: string[];
  skillsUsed: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class JobHistory {
  private constructor(
    private props: JobHistoryProps,
    private _id: UniqueEntityID
  ) {}

  public static create(props: Omit<JobHistoryProps, 'createdAt' | 'updatedAt'>, id?: UniqueEntityID): Result<JobHistory> {
    const jobHistoryProps: JobHistoryProps = {
      ...props,
      achievements: props.achievements || [],
      skillsUsed: props.skillsUsed || [],
      isCurrent: props.isCurrent || false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return Result.ok(new JobHistory(jobHistoryProps, id || new UniqueEntityID()));
  }

  get id(): UniqueEntityID {
    return this._id;
  }

  get duration(): string {
    const start = this.props.startDate;
    const end = this.props.endDate || new Date();
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    
    if (months < 12) {
      return `${months} month${months !== 1 ? 's' : ''}`;
    }
    
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (remainingMonths === 0) {
      return `${years} year${years !== 1 ? 's' : ''}`;
    }
    
    return `${years} year${years !== 1 ? 's' : ''} ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
  }

  public endEmployment(endDate: Date): void {
    this.props.endDate = endDate;
    this.props.isCurrent = false;
    this.props.updatedAt = new Date();
  }

  public addAchievement(achievement: string): void {
    if (!this.props.achievements.includes(achievement)) {
      this.props.achievements.push(achievement);
      this.props.updatedAt = new Date();
    }
  }

  public addSkill(skill: string): void {
    if (!this.props.skillsUsed.includes(skill)) {
      this.props.skillsUsed.push(skill);
      this.props.updatedAt = new Date();
    }
  }

  public toJSON(): JobHistoryProps & { id: string } {
    return {
      id: this._id.toString(),
      ...this.props
    };
  }
}
