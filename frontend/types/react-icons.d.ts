// Ambient type declarations for react-icons
// No top-level imports — this must stay as a pure ambient declaration file

declare module 'react-icons/bi' {
  import { SVGAttributes, ComponentType } from 'react';
  interface IconBaseProps extends SVGAttributes<SVGElement> {
    size?: string | number;
    color?: string;
    title?: string;
  }
  type IconType = ComponentType<IconBaseProps>;

  // Regular icons
  export const BiArrowBack: IconType;
  export const BiBarChart: IconType;
  export const BiBriefcase: IconType;
  export const BiBlock: IconType;
  export const BiBox: IconType;
  export const BiCalendar: IconType;
  export const BiCapsule: IconType;
  export const BiCheck: IconType;
  export const BiCheckCircle: IconType;
  export const BiChevronDown: IconType;
  export const BiChevronLeft: IconType;
  export const BiChevronRight: IconType;
  export const BiChevronUp: IconType;
  export const BiClipboard: IconType;
  export const BiCreditCard: IconType;
  export const BiDownload: IconType;
  export const BiEnvelope: IconType;
  export const BiError: IconType;
  export const BiFile: IconType;
  export const BiFilter: IconType;
  export const BiHelpCircle: IconType;
  export const BiHide: IconType;
  export const BiHome: IconType;
  export const BiInfoCircle: IconType;
  export const BiLock: IconType;
  export const BiLogOut: IconType;
  export const BiMap: IconType;
  export const BiMenu: IconType;
  export const BiMoney: IconType;
  export const BiPencil: IconType;
  export const BiPhone: IconType;
  export const BiPlusCircle: IconType;
  export const BiPrinter: IconType;
  export const BiRefresh: IconType;
  export const BiSave: IconType;
  export const BiSearch: IconType;
  export const BiShow: IconType;
  export const BiSort: IconType;
  export const BiSupport: IconType;
  export const BiTime: IconType;
  export const BiTrash: IconType;
  export const BiUpload: IconType;
  export const BiUser: IconType;
  export const BiUserPlus: IconType;
  export const BiWallet: IconType;
  export const BiX: IconType;

  // Solid icons
  export const BiSolidAward: IconType;
  export const BiSolidCheckCircle: IconType;
  export const BiSolidCloudLightning: IconType;
  export const BiSolidFile: IconType;
  export const BiSolidPencil: IconType;
  export const BiSolidUserCheck: IconType;
  export const BiSolidUserPlus: IconType;
}

declare module 'react-icons/io5' {
  import { SVGAttributes, ComponentType } from 'react';
  interface IconBaseProps extends SVGAttributes<SVGElement> {
    size?: string | number;
    color?: string;
    title?: string;
  }
  type IconType = ComponentType<IconBaseProps>;

  export const IoClose: IconType;
  export const IoCheckmark: IconType;
  export const IoAlert: IconType;
}

declare module 'react-icons/ai' {
  import { SVGAttributes, ComponentType } from 'react';
  interface IconBaseProps extends SVGAttributes<SVGElement> {
    size?: string | number;
    color?: string;
    title?: string;
  }
  type IconType = ComponentType<IconBaseProps>;

  export const AiOutlineClose: IconType;
  export const AiFillStar: IconType;
  export const AiOutlineStar: IconType;
}

declare module 'react-icons/fi' {
  import { SVGAttributes, ComponentType } from 'react';
  interface IconBaseProps extends SVGAttributes<SVGElement> {
    size?: string | number;
    color?: string;
    title?: string;
  }
  type IconType = ComponentType<IconBaseProps>;

  export const FiAlertTriangle: IconType;
  export const FiSettings: IconType;
  export const FiBell: IconType;
}

declare module 'react-icons/md' {
  import { SVGAttributes, ComponentType } from 'react';
  interface IconBaseProps extends SVGAttributes<SVGElement> {
    size?: string | number;
    color?: string;
    title?: string;
  }
  type IconType = ComponentType<IconBaseProps>;

  export const MdOutlineMedicalServices: IconType;
  export const MdDashboard: IconType;
}
