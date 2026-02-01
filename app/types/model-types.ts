import type { BelongsTo, HasMany, HasOne, ManyToMany } from '@adonisjs/lucid/types/relations'

import type { DateTime } from 'luxon'
import type Activity from '#models/activity'
import type BlogAuthor from '#models/blog_author'
import type BlogCategory from '#models/blog_category'
import type BlogPost from '#models/blog_post'
import type BlogTag from '#models/blog_tag'
import type DbBackup from '#models/db_backup'
import type Lease from '#models/lease'
import type LeaseableEntity from '#models/leaseable_entity'
import type Org from '#models/org'
import type Payment from '#models/payment'
import type Property from '#models/property'
import type Session from '#models/session'
import type Team from '#models/team'
import type TeamInvitation from '#models/team_invitation'
import type TeamMember from '#models/team_member'
import type Tenant from '#models/tenant'
import type User from '#models/user'

type ExtractModelType<T> = Omit<
  {
    [K in keyof T as T[K] extends Function ? never : K]: T[K] extends {
      compute: () => infer R
    }
      ? R extends DateTime
        ? string
        : R
      : T[K] extends DateTime | null
        ? string
        : T[K] extends BelongsTo<infer U>
          ? ExtractModelType<InstanceType<U>>
          : T[K] extends HasOne<infer U>
            ? ExtractModelType<InstanceType<U>>
            : T[K] extends HasMany<infer U>
              ? ExtractModelType<InstanceType<U>>[]
              : T[K] extends ManyToMany<infer U>
                ? ExtractModelType<InstanceType<U>>[]
                : T[K]
  },
  | '$trx'
  | '$attributes'
  | '$preloaded'
  | '$relations'
  | '$dirty'
  | '$original'
  | '$extras'
  | '$columns'
  | '$sideloaded'
  | '$primaryKeyValue'
  | '$isPersisted'
  | '$isNew'
  | '$isLocal'
  | '$isDirty'
  | '$isDeleted'
  | '$options'
>

export type RawSession = ExtractModelType<Session>
export type RawTeam = ExtractModelType<Team>
export type RawTeamInvitation = ExtractModelType<TeamInvitation>
export type RawTeamMember = ExtractModelType<TeamMember>
export type RawBlogCategory = ExtractModelType<BlogCategory>
export type RawBlogAuthor = ExtractModelType<BlogAuthor>
export type RawBlogPost = ExtractModelType<BlogPost>
export type RawBlogTag = ExtractModelType<BlogTag>
export type RawUser = ExtractModelType<User>
export type RawLease = ExtractModelType<Lease>
export type RawLeaseableEntity = ExtractModelType<LeaseableEntity>
export type RawProperty = ExtractModelType<Property>
export type RawTenant = ExtractModelType<Tenant>
export type RawPayment = ExtractModelType<Payment>
export type RawActivity = ExtractModelType<Activity>
export type RawOrg = ExtractModelType<Org>
export type RawDbBackup = ExtractModelType<DbBackup>
