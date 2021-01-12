import React from 'react';
import { useTranslation } from 'react-i18next';

import {
  SWrapper, SLink, SExternalLink, SSeparator,
} from './styled';

const Separator = () => <SSeparator>·</SSeparator>;

// @todo routes to constants

const Footer = () => {
  const { t } = useTranslation();

  return (
    <SWrapper>
      <SLink to="/about">
        {t('footer.about')}
      </SLink>

      <Separator />

      <SLink to="/about">
        {t('footer.legal')}
      </SLink>

      <Separator />

      <SLink to="/contact">
        {t('footer.contact')}
      </SLink>

      <Separator />

      <SExternalLink
        href={process.env.REACT_APP_EXTERNAL_LINK_GITHUB}
        target="_blank"
      >
        {t('footer.github')}
      </SExternalLink>
    </SWrapper>
  );
};

export default Footer;
