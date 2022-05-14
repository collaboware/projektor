import { NamedNode, Literal } from 'rdflib'
import { Shape } from 'shex-methods'

export type FollowingShape = {
  id: string // the url of a node of this shape
  following?: string | string[] // The webId of somebody that is followed
} & {
  type: FollowingShapeType.Following // Defines the node as somebody that is followed (from projektor)
}

export type FollowingShapeCreateArgs = {
  id?: string | NamedNode // the url to match or create the node with e.g. 'https://example.com#this', 'https://example.com/profile/card#me'
  following?: URL | NamedNode | (URL | NamedNode)[] // The webId of somebody that is followed
} & {
  type: FollowingShapeType.Following // Defines the node as somebody that is followed (from projektor)
}

export type FollowingShapeUpdateArgs = Partial<FollowingShapeCreateArgs>

export type FollowingShapeIndex = {
  id: string // the url of a node of this shape
  followingIndex: string // The index of the webIds that are followed
} & {
  type: FollowingShapeIndexType.FollowingIndex // Defines the node as somebody that is followed (from projektor)
}

export type FollowingShapeIndexCreateArgs = {
  id?: string | NamedNode // the url to match or create the node with e.g. 'https://example.com#this', 'https://example.com/profile/card#me'
  followingIndex: URL | NamedNode // The index of the webIds that are followed
} & {
  type: FollowingShapeIndexType.FollowingIndex // Defines the node as somebody that is followed (from projektor)
}

export type FollowingShapeIndexUpdateArgs =
  Partial<FollowingShapeIndexCreateArgs>

export enum FollowingShapeType {
  Following = 'https://dips.projektor.technology/projektor/Following',
}

export enum FollowingShapeIndexType {
  FollowingIndex = 'https://dips.projektor.technology/projektor/FollowingIndex',
}

export enum FollowingShapeContext {
  type = 'rdf:type',
  following = 'prk:following',
}

export enum FollowingShapeIndexContext {
  type = 'rdf:type',
  followingIndex = 'prk:followingIndex',
}

export const projektorFollowerShex = `
PREFIX prk: <https://dips.projektor.technology/projektor/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

prk:FollowingShape EXTRA a {
    a [ prk:Following ]
      // rdfs:comment  "Defines the node as somebody that is followed (from projektor)" ;
    prk:following IRI *
      // rdfs:comment  "The webId of somebody that is followed" ;
}

prk:FollowingShapeIndex EXTRA a {
    a [ prk:FollowingIndex ]
      // rdfs:comment  "Defines the node as somebody that is followed (from projektor)" ;
    prk:followingIndex IRI
      // rdfs:comment  "The index of the webIds that are followed" ;
}
`

export const following = new Shape<FollowingShape, FollowingShapeCreateArgs>({
  id: 'https://dips.projektor.technology/projektor/FollowingShape',
  shape: projektorFollowerShex,
  context: FollowingShapeContext,
  type: FollowingShapeType,
})

export const followingIndex = new Shape<
  FollowingShapeIndex,
  FollowingShapeIndexCreateArgs
>({
  id: 'https://dips.projektor.technology/projektor/FollowingShapeIndex',
  shape: projektorFollowerShex,
  context: FollowingShapeIndexContext,
  type: FollowingShapeIndexType,
})

export type PostShape = {
  id: string // the url of a node of this shape
  caption?: string // The caption of a post
  link: string // The link to a post resources
} & {
  type: PostShapeType.Post // Defines the node as a Post (from projektor)
}

export type PostShapeCreateArgs = {
  id?: string | NamedNode // the url to match or create the node with e.g. 'https://example.com#this', 'https://example.com/profile/card#me'
  caption?: string | Literal // The caption of a post
  link: URL | NamedNode // The link to a post resources
} & {
  type: PostShapeType.Post // Defines the node as a Post (from projektor)
}

export type PostShapeUpdateArgs = Partial<PostShapeCreateArgs>

export type PostShapeIndex = {
  id: string // the url of a node of this shape
  link: string // The link to a post
} & {
  type: PostShapeIndexType.Post // Defines the node as a Post (from projektor)
}

export type PostShapeIndexCreateArgs = {
  id?: string | NamedNode // the url to match or create the node with e.g. 'https://example.com#this', 'https://example.com/profile/card#me'
  link: URL | NamedNode // The link to a post
} & {
  type: PostShapeIndexType.Post // Defines the node as a Post (from projektor)
}

export type PostShapeIndexUpdateArgs = Partial<PostShapeIndexCreateArgs>

export enum PostShapeType {
  Post = 'https://dips.projektor.technology/projektor/Post',
}

export enum PostShapeIndexType {
  Post = 'https://dips.projektor.technology/projektor/Post',
}

export enum PostShapeContext {
  type = 'rdf:type',
  caption = 'prk:caption',
  link = 'prk:link',
}

export enum PostShapeIndexContext {
  type = 'rdf:type',
  link = 'prk:link',
}

export const projektorPostShex = `
PREFIX prk: <https://dips.projektor.technology/projektor/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

prk:PostShape EXTRA a {
  a [ prk:Post ]
    // rdfs:comment  "Defines the node as a Post (from projektor)" ;
  prk:caption xsd:string ?
    // rdfs:comment  "The caption of a post" ;
  prk:link IRI
    // rdfs:comment  "The link to a post resources" ;
}

prk:PostShapeIndex EXTRA a {
  a [ prk:Post ]
    // rdfs:comment  "Defines the node as a Post (from projektor)" ;
  prk:link IRI
    // rdfs:comment  "The link to a post" ;
}
`

export const post = new Shape<PostShape, PostShapeCreateArgs>({
  id: 'https://dips.projektor.technology/projektor/PostShape',
  shape: projektorPostShex,
  context: PostShapeContext,
  type: PostShapeType,
})

export const postIndex = new Shape<PostShapeIndex, PostShapeIndexCreateArgs>({
  id: 'https://dips.projektor.technology/projektor/PostShapeIndex',
  shape: projektorPostShex,
  context: PostShapeIndexContext,
  type: PostShapeIndexType,
})

export type SolidProfileShape = {
  id: string // the url of a node of this shape
  fn?: string // The formatted name of a person. Example: John Smith
  name?: string // An alternate way to define a person's name.
  hasPhoto?: string // A link to the person's photo
  img?: string // Photo link but in string form
  inbox: string // The user's LDP inbox to which apps can post notifications
  storage?: string | string[] // The location of a Solid storage server related to this WebId
  account?: string // The user's account
  privateTypeIndex?: string | string[] // A registry of all types used on the user's Pod (for private access only)
  publicTypeIndex?: string | string[] // A registry of all types used on the user's Pod (for public access)
  knows?: string | string[] // A list of WebIds for all the people this user knows.
} & {
  type: (SolidProfileShapeType.SchemPerson | SolidProfileShapeType.FoafPerson)[] // Defines the node as a Person (from foaf)
}

export type SolidProfileShapeCreateArgs = {
  id?: string | NamedNode // the url to match or create the node with e.g. 'https://example.com#this', 'https://example.com/profile/card#me'
  fn?: string | Literal // The formatted name of a person. Example: John Smith
  name?: string | Literal // An alternate way to define a person's name.
  hasPhoto?: URL | NamedNode // A link to the person's photo
  img?: string | Literal // Photo link but in string form
  inbox: URL | NamedNode // The user's LDP inbox to which apps can post notifications
  storage?: URL | NamedNode | (URL | NamedNode)[] // The location of a Solid storage server related to this WebId
  account?: URL | NamedNode // The user's account
  privateTypeIndex?: URL | NamedNode | (URL | NamedNode)[] // A registry of all types used on the user's Pod (for private access only)
  publicTypeIndex?: URL | NamedNode | (URL | NamedNode)[] // A registry of all types used on the user's Pod (for public access)
  knows?: URL | NamedNode | (URL | NamedNode)[] // A list of WebIds for all the people this user knows.
} & {
  type: (SolidProfileShapeType.SchemPerson | SolidProfileShapeType.FoafPerson)[] // Defines the node as a Person (from foaf)
}

export type SolidProfileShapeUpdateArgs = Partial<SolidProfileShapeCreateArgs>

export enum SolidProfileShapeType {
  SchemPerson = 'http://schema.org/Person',
  FoafPerson = 'http://xmlns.com/foaf/0.1/Person',
}

export enum SolidProfileShapeContext {
  type = 'rdf:type',
  fn = 'vcard:fn',
  name = 'foaf:name',
  hasPhoto = 'vcard:hasPhoto',
  img = 'foaf:img',
  inbox = 'ldp:inbox',
  storage = 'sp:storage',
  account = 'solid:account',
  privateTypeIndex = 'solid:privateTypeIndex',
  publicTypeIndex = 'solid:publicTypeIndex',
  knows = 'foaf:knows',
}

export const solidProfileShex = `
PREFIX srs: <https://shaperepo.com/schemas/solidProfile#>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX schem: <http://schema.org/>
PREFIX vcard: <http://www.w3.org/2006/vcard/ns#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX acl: <http://www.w3.org/ns/auth/acl#>
PREFIX cert:  <http://www.w3.org/ns/auth/cert#>
PREFIX ldp: <http://www.w3.org/ns/ldp#>
PREFIX sp: <http://www.w3.org/ns/pim/space#>
PREFIX solid: <http://www.w3.org/ns/solid/terms#>

srs:SolidProfileShape EXTRA a {
  a [ schem:Person ]
    // rdfs:comment  "Defines the node as a Person (from Schema.org)" ;
  a [ foaf:Person ]
    // rdfs:comment  "Defines the node as a Person (from foaf)" ;
  vcard:fn xsd:string ?
    // rdfs:comment  "The formatted name of a person. Example: John Smith" ;
  foaf:name xsd:string ?
    // rdfs:comment  "An alternate way to define a person's name." ;
  vcard:hasPhoto IRI ?
    // rdfs:comment  "A link to the person's photo" ;
  foaf:img xsd:string ?
    // rdfs:comment  "Photo link but in string form" ;
  ldp:inbox IRI
    // rdfs:comment  "The user's LDP inbox to which apps can post notifications" ;
  sp:storage IRI *
    // rdfs:comment  "The location of a Solid storage server related to this WebId" ;
  solid:account IRI ?
    // rdfs:comment  "The user's account" ;
  solid:privateTypeIndex IRI *
    // rdfs:comment  "A registry of all types used on the user's Pod (for private access only)" ;
  solid:publicTypeIndex IRI *
    // rdfs:comment  "A registry of all types used on the user's Pod (for public access)" ;
  foaf:knows IRI *
    // rdfs:comment  "A list of WebIds for all the people this user knows." ;
}
`

export const solidProfile = new Shape<
  SolidProfileShape,
  SolidProfileShapeCreateArgs
>({
  id: 'https://shaperepo.com/schemas/solidProfile#SolidProfileShape',
  shape: solidProfileShex,
  context: SolidProfileShapeContext,
  type: SolidProfileShapeType,
})
